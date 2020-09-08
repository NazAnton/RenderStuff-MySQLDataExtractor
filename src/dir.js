import fs from 'fs';
import path from 'path';

function forceCreateDir(targetFolder) {
  try {
    if (!fs.existsSync(targetFolder)) {
      console.log('Creating dir:', targetFolder);
      fs.mkdirSync(targetFolder, { recursive: true });
    }
  } catch (err) {
    console.log(err);
  }
}

function writeFile(targetFolder, fileName, objString) {
  forceCreateDir(targetFolder);

  const fullFileName = path.resolve(targetFolder, fileName);

  fs.writeFile(fullFileName, objString, 'utf8', (err) => {
    if (err) console.log(err);
  });
}

function writeJSON(targetFolder, fileName, obj) {
  let objString = null;

  try {
    objString = JSON.stringify(obj, null, 2);
  } catch (err) {
    console.log(err);
  }

  writeFile(targetFolder, 'data.json', objString);
}

const temp = 'e:/o9RenderStuff/3MySQLDataExtractor/temp/';
const contents = path.resolve(temp, 'contents');

export default Object.freeze({
  oldContent: 'c:/OSPanel/domains/rs.local.com/rs17-static/',
  temp,
  contents,
  '3d-models': path.resolve(contents, '3d-models'),
  downloads: path.resolve(temp, 'static', 'downloads'),
});

function copyFile(sourceFullFileName, targetFullFileName, targetFolder) {
  forceCreateDir(targetFolder);

  fs.copyFile(sourceFullFileName, targetFullFileName, (err) => {
    if (err) console.log(err);
  });
}

export { writeFile, writeJSON, copyFile };
