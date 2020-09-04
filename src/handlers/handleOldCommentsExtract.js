import fs from 'fs';
import path from 'path';
import sanitizeHtml from 'sanitize-html';

import { connect, query, close } from '../database.js';

const queries = {
  1: 'SHOW DATABASES',
  2: 'SELECT * FROM `comments` WHERE `belonging` = ',
};

const dictionary = {
  1: 'No ID provided, please provide an ID.',
};

async function extractOldCommentsByID(DB, res, belongingID) {
  if (!belongingID) {
    res.json({ error: dictionary[1] });
    console.log(dictionary[1]);
    return;
  }

  let results = [];
  try {
    results = await query(`${queries[2]}${belongingID}`);
  } catch (err) {
    console.log(err);
    res.status(400).send(err);
    return;
  }

  if (results.length === 0) {
    const noRes = `No results for ID ${belongingID}, please choose another ID.`;
    console.log(noRes);
    res.json(noRes);
    return;
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
  } catch (err) {
    console.log(err);
  }
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
