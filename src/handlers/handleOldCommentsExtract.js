import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

import { connect, close } from '../database.js';

const queries = {
  1: 'SHOW DATABASES',
  2: 'SELECT * FROM `comments` WHERE `belonging` = ',
};

function extractOldCommentsByID(DB, res, belongingID) {
  if (!belongingID) {
    res.json({ error: 'No ID provided, please provide an ID.' });
    return null;
  }
  // (error, results, fields)
  DB.query(`${queries[2]}${belongingID}`, (error, results) => {
    if (error) {
      console.log(error);
      res.status(400).send(error);
    } else {
      if (results.length === 0) {
        const noRes = `No results for ID ${belongingID}, please choose another ID.`;
        console.log(noRes);
        res.json(noRes);
        return null;
      }
      const commentsWSanitize = results.map((comment) => {
        const { autotext_en: dirty } = comment;
        const sanitizedHtml = sanitizeHtml(dirty);
        return { ...comment, sanitizedHtml };
      });

      const oldComments = { oldComments: commentsWSanitize };
      res.json(oldComments);

      try {
        const oldCommentsString = JSON.stringify(oldComments, null, '\t');
        const fileFullPath = path.resolve(__dirname, '..', '..', 'temp', 'oldComments.json');

        fs.writeFile(fileFullPath, oldCommentsString, (err) => {
          if (err) throw err;
          console.log('Write file to:', fileFullPath);
        });
      } catch (e) {
        console.log(e);
        return false;
      }
    }

    return null;
  });

  return true;
}

async function handleRequest(req, res) {
  try {
    const DB = await connect();
    const { ID } = req.body;
    extractOldCommentsByID(DB, res, ID);

    close();
  } catch (err) {
    res.json({ error: 'Database connection not established.' });
  }
}

export default handleRequest;
