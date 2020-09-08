/* eslint-disable camelcase */
import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

import { connect, query, close } from '../database.js';
import dir, { writeFile, writeJSON, copyFile } from '../dir.js';
import pathFormat from '../../../1Site/src/utils/pathFormat.js';

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

function parseStockPage(html_en) {
  const regex = /<a.*href="(https?:\/\/www.turbosquid.com\/.*)">/g;
  // console.log('match(regex):', image_path.match(regex));
  const matchGroups = regex.exec(html_en);
  // regex.lastIndex = 0;
  if (matchGroups === null) {
    console.log('===================');
    console.log(html_en);
    console.log('===================');
  }
  return matchGroups !== null ? matchGroups[1] : null;
}

function removeLastSegment(pathSegments) {
  const pathSegmentsDefined = pathFormat.shapeRelativeDirStr(pathSegments).split('/');

  pathSegmentsDefined.pop();

  return pathSegmentsDefined.join('/');
}

function defineDownloads(oldPublicationFilesFolder) {
  const dirContent = fs.readdirSync(path.resolve(dir.oldContent, oldPublicationFilesFolder));

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

function defineSubtype(oldModelData, html_en, oldPublicationFilesFolder) {
  const { feature, group } = oldModelData;
  let subtype = null;

  if (group === dictionary[1])
    subtype = {
      price: parsePrice(feature),
      stockPage: parseStockPage(html_en) || 'https://address?referral=RenderStuff',
    };
  else
    subtype = {
      downloads: defineDownloads(oldPublicationFilesFolder),
    };

  return subtype;
}

function replaceSlashedQuotes(html_en) {
  const rawHTMLString = String.raw`${html_en}`;
  // replace all "\" with "/"
  return rawHTMLString.replace(/\\/g, '');
}

function parseExcerptMDX(html_en) {
  // add "img"
  let allowedTagsDefined = sanitizeHtml.defaults.allowedTags.concat(['img']);
  // remove "ul" and "li"
  allowedTagsDefined = allowedTagsDefined.filter((tag) => tag !== 'ul' && tag !== 'li');

  let sanitizedHtml = sanitizeHtml(html_en, {
    allowedTags: allowedTagsDefined,
  });

  // pattern to download links
  const regexDownloadLinks = /<a href="http:\/\/i\.renderstuff\.com\/content\/publication-files\/.*<\/a>/g;
  // pattern for two <br />
  const regexTwoBr = /<br \/>[\r\n]+<br \/>/g;

  sanitizedHtml = sanitizedHtml.replace(regexDownloadLinks, '');
  sanitizedHtml = sanitizedHtml.replace(regexTwoBr, '<br />');
  // additional pass, to remove double <br /> which still left after first pass over four <br />
  sanitizedHtml = sanitizedHtml.replace(regexTwoBr, '<br />');

  return sanitizedHtml;
}

function defineThumbnail(oldPublicationFilesFolder, image_path) {
  const bigPath = path.resolve(dir.oldContent, oldPublicationFilesFolder, 'big.jpg');

  if (fs.existsSync(bigPath)) return bigPath;

  return path.resolve(dir.oldContent, image_path);
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
  const { id, timestamp, html_en, image_path } = oldModelData;
  const excerptMDX = parseExcerptMDX(html_en);
  const htmlEnNoQuotes = replaceSlashedQuotes(html_en);
  // image_path "content/publication-files/0001/tooltip.jpg"
  const oldPublicationFilesFolder = removeLastSegment(image_path);
  const relativeDirectory = makeRelDir(oldModelData);

  const dataJSON = {
    dateCreation: timestamp,
    dateCreationOverride: timestamp,
    descriptionSEO: null,
    thumbnail: {
      fileName: fileNameFormRelDir(relativeDirectory),
    },
    subtype: defineSubtype(oldModelData, htmlEnNoQuotes, oldPublicationFilesFolder),
    tags: {
      common: [{ text: 'NO Tags Items', type: 'danger' }],
    },
  };

  const driveData = {
    relativeDirectory,
    oldID: Number.parseInt(id, 10).toString(), // removing leading zeros
    oldPublicationFilesFolder,
    oldThumbnailFullFileName: defineThumbnail(oldPublicationFilesFolder, image_path),
    excerptMDX,
  };

  return { dataJSON, driveData };
}

function create3dModelsContents(shapedDataArray) {
  console.log(shapedDataArray);
  try {
    shapedDataArray.forEach((shapedData) => {
      const { dataJSON, driveData } = shapedData;
      const {
        relativeDirectory,
        oldID,
        oldPublicationFilesFolder,
        oldThumbnailFullFileName,
        excerptMDX,
      } = driveData;
      const {
        subtype: { downloads },
      } = dataJSON;
      const itemFolder = path.resolve(dir['3d-models'], '2009-2019', relativeDirectory);

      // data.json
      writeJSON(itemFolder, 'data.json', dataJSON);

      // thumbnail
      const itemImagesFolder = path.resolve(itemFolder, 'images');
      const thumbnailFullFileName = path.resolve(itemImagesFolder, dataJSON.thumbnail.fileName);
      copyFile(oldThumbnailFullFileName, thumbnailFullFileName, itemImagesFolder);

      // excerpt
      writeFile(itemFolder, 'excerpt.mdx', excerptMDX);

      if (dataJSON.subtype.downloads) {
        // downloads
        Object.keys(downloads).forEach((format) => {
          const zipFileName = downloads[format];
          const oldZipFullFileName = path.join(
            dir.oldContent,
            oldPublicationFilesFolder,
            zipFileName
          );
          const zipFolder = path.join(dir.downloads, oldID);
          const zipFullFileName = path.join(zipFolder, zipFileName);

          copyFile(oldZipFullFileName, zipFullFileName, zipFolder);
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
}

async function extract3dModels() {
  const results = await queryAllModelsDataRaw();

  let shapedData = null;
  try {
    shapedData = results.map((result) => shape3dModelsData(result));
  } catch (err) {
    console.log(err);
  }

  return shapedData;
}

async function handleRequest(_, res) {
  try {
    await connect();
  } catch (err) {
    res.json({ error: 'Database connection not established.' });
  }

  let shapedDataArray = null;
  try {
    shapedDataArray = await extract3dModels(res);
  } catch (err) {
    res.json({ 'Error during extract 3d Models': err });
  }

  try {
    create3dModelsContents(shapedDataArray);
    console.log('3d Models extraction finished');
    res.json('3d Models extraction finished');
  } catch (err) {
    res.json({ 'Error during create 3d Models contents': err });
  }

  close();
}

export default handleRequest;
