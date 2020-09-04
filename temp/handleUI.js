import serializeJS from 'serialize-javascript';

import { fetchData, fetchOldCommentsByID } from './fetchData.js';

function initFetchData() {
  window.hostName = 'http://localhost:3000';
  let buttonEl = null;

  // extractOldCommentsByID
  buttonEl = document.getElementById('extractOldCommentsByID-button');
  const fetchOldCommentsByIDButton = () => fetchData('fetchOldCommentsByID');
  buttonEl.addEventListener('click', fetchOldCommentsByIDButton);
}

const htmlTemplate = `
<!doctype html>
<html class="no-js" lang="">
<script>
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>')
</script> 
<script>
${serializeJS(fetchData)}
${serializeJS(fetchOldCommentsByID)}
${serializeJS(initFetchData)}
</script>
<head>
<meta charset="utf-8">
<title></title>
<meta name="description" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  ID: <input id="extractOldCommentsByID-input" />
  <button id="extractOldCommentsByID-button">Extract Old Comment By ID</button>
</body>
<script>
  initFetchData();
</script>
</html>
`;

export default function handleUI(__, res) {
  res.send(htmlTemplate);
}
