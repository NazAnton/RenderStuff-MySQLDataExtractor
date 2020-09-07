const htmlTemplate = `
<!doctype html>
<html class="no-js" lang="">
<script>
  document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
  ':35729/livereload.js?snipver=1"></' + 'script>')
</script>
<head>
<meta charset="utf-8">
<title></title>
<meta name="description" content="">
<meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  ID: <input id="extractOldCommentsByID-input" type="number"/>
  <button id="extractOldCommentsByID-button">Extract Old Comment By ID</button>
  <br /><br />
  <button id="extract3dModels-button">Extract 3D Models</button>
</body>
<script src="http://localhost:3000/app.dist.js"></script>
</html>
`;

export default function handleUI(__, res) {
  res.send(htmlTemplate);
}
