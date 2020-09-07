// import serializeJS from 'serialize-javascript';

import fetchData from './fetchData.js';

function initFetchData() {
  window.hostName = 'http://localhost:3000';
  let buttonEl = null;

  // extractOldCommentsByID
  buttonEl = document.getElementById('extractOldCommentsByID-button');
  const fetchOldCommentsByIDButton = () => fetchData('fetchOldCommentsByID');
  buttonEl.addEventListener('click', fetchOldCommentsByIDButton);

  // handle3dModelsExtract
  buttonEl = document.getElementById('extract3dModels-button');
  const fetch3dModelsButton = () => fetchData('extract3dModels');
  buttonEl.addEventListener('click', fetch3dModelsButton);
}

initFetchData();
