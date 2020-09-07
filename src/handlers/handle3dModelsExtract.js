/* eslint-disable camelcase */
import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

import { connect, query, close } from '../database.js';
import pathFormat from '../../../1Site/src/utils/pathFormat.js';

const contentFolderLocation = 'c:/OSPanel/domains/rs.local.com/rs17-static/';

const dictionary = {
  1: '3d-models-pro',
  2: '3d-models-free',
};

const queries = {
  1: `SELECT * FROM \`posts\` WHERE \`group\` = '${dictionary[1]}' OR \`group\` = '${dictionary[2]}'`,
};

async function queryAllModelsDataRaw() {
  let results = [];
  try {
    results = await query(queries[1]);
  } catch (err) {
    console.log(err);
    return { error: err };
  }

  return results;
}

function parsePrice(feature) {
  // 29;1321931
  return Number.parseInt(feature.split(';')[0], 10);
}

function parseStockPage(excerptMDX) {
  const regex = /<a href="(https?:\/\/www.turbosquid.com\/.*)">/g;
  return regex.exec(excerptMDX)[1];
}

function removeLastSegment(pathSegments) {
  const pathSegmentsDefined = pathFormat.shapeRelativeDirStr(pathSegments).split('/');

  pathSegmentsDefined.pop();

  return pathSegmentsDefined.join('/');
}

function defineDownloads(oldFilesDir) {
  const dirContent = fs.readdirSync(path.resolve(contentFolderLocation, oldFilesDir));

  const zipFiles = dirContent.filter((filename) => {
    return path.extname(filename) === '.zip';
  });

  const downloads = {};

  zipFiles.forEach((zipFile) => {
    ['MAX', 'FBX', 'OBJ', '_3DS'].some((format) => {
      const searchSubstring = `_${format === '_3DS' ? '3ds' : format.toLowerCase()}.zip`;
      if (zipFile.includes(searchSubstring)) {
        downloads[format] = zipFile;
        return true;
      }

      return false;
    });
  });

  return downloads;
}

function defineSubtype(oldModelData, excerptMDX, oldFilesDir) {
  const { feature, group } = oldModelData;
  let subtype = null;

  if (group === dictionary[1])
    subtype = {
      price: parsePrice(feature),
      stockPage: parseStockPage(excerptMDX) || 'https://address?referral=RenderStuff',
    };
  else
    subtype = {
      downloads: defineDownloads(oldFilesDir),
    };

  return subtype;
}

function replaceSlashedQuotes(html_en) {
  const rawHTMLString = String.raw`${html_en}`;
  // replace all "\" with "/"
  return rawHTMLString.replace(/\\/g, '');
}

function parseExcerptMDX(html_en) {
  return sanitizeHtml(replaceSlashedQuotes(html_en), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
  });
}

function defineThumbnail(oldFilesDir, image_path) {
  const bigPath = path.resolve(contentFolderLocation, oldFilesDir, 'big.jpg');

  if (fs.existsSync(bigPath)) return bigPath;

  return path.resolve(contentFolderLocation, image_path);
}

function makeRelDir(oldModelData) {
  const { id, title_en } = oldModelData;
  const titleNo3dModel = title_en.toLowerCase().replace(/\s3d model?s?/g, '');

  return `${Number.parseInt(id, 10)}-${titleNo3dModel.split(' ').join('-')}`;
}

function fileNameFormRelDir(relativeDirectory) {
  const fileNameDefined = relativeDirectory.split('-');

  fileNameDefined.shift();

  return `00-${fileNameDefined.join('-')}.jpg`;
}

function shape3dModelsData(oldModelData) {
  const { timestamp, html_en, image_path } = oldModelData;
  const excerptMDX = parseExcerptMDX(html_en);
  // image_path "content/publication-files/0001/tooltip.jpg"
  const oldFilesDir = removeLastSegment(image_path);
  const relativeDirectory = makeRelDir(oldModelData);

  const dataJSON = {
    dateCreation: timestamp,
    dateCreationOverride: timestamp,
    descriptionSEO: null,
    thumbnail: {
      fileName: fileNameFormRelDir(relativeDirectory),
    },
    subtype: defineSubtype(oldModelData, excerptMDX, oldFilesDir),
    tags: {
      common: [{ text: 'NO Tags Items', type: 'danger' }],
    },
  };

  const driveData = {
    relativeDirectory,
    thumbnailFileName: defineThumbnail(oldFilesDir, image_path),
    excerptMDX,
  };

  return { dataJSON, driveData };
}

async function extract3dModels() {
  const results = await queryAllModelsDataRaw();

  let shapedData = null;
  try {
    shapedData = results.map((result) => shape3dModelsData(result));
  } catch (err) {
    console.log(err);
  }

  return { shapedData };
}

async function handleRequest(_, res) {
  try {
    await connect();
  } catch (err) {
    res.json({ error: 'Database connection not established.' });
  }

  let results = [];
  try {
    results = await extract3dModels(res);
  } catch (err) {
    res.json({ error: 'Cannot extract 3d Models.' });
  }

  res.json(results);

  close();
}

export default handleRequest;
