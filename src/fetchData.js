async function fetchOldCommentsByID() {
  let data = null;
  const inputEL = document.getElementById('extractOldCommentsByID-input');
  const ID = inputEL.value;

  console.log(ID);

  const response = await fetch('/api/extract-old-comments-by-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ID }),
  });

  try {
    data = await response.json();
  } catch (err) {
    console.log(err);
  }

  return data;
}

async function fetch3dModels() {
  let data = null;
  const inputEL = document.getElementById('extractOldCommentsByID-input');
  const ID = inputEL.value;

  console.log(ID);

  const response = await fetch('/api/extract-3d-models');
  console.log('response:', response);

  try {
    data = await response.json();
  } catch (err) {
    console.log(err);
  }

  return data;
}

async function fetchData(key) {
  let data = null;

  switch (key) {
    case 'fetchOldCommentsByID':
      data = await fetchOldCommentsByID();
      break;

    case 'extract3dModels':
      data = await fetch3dModels();
      break;

    default:
      console.log(`No fetch handlers by ${key} key`);
  }

  console.log(data);
}

export default fetchData;
