import express from 'express';

import handleIndexHTML from './src/handlers/handleIndexHTML.js';
import handleOldCommentsExtract from './src/handlers/handleOldCommentsExtract.js';

const app = express();
const apiRouter = express.Router();

app.use(express.json());

app.use(express.static(`${__dirname}/public`));

apiRouter.post('/extract-old-comments-by-id', handleOldCommentsExtract);
app.use('/api', apiRouter);

app.get('/', handleIndexHTML);

app.listen(3000, () => {
  console.log('Listening on http://localhost:3000/');
});
