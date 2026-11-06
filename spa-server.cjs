const express = require('express');
const path = require('node:path');

const app = express();
const distPath = path.resolve('/sessions/sleepy-serene-archimedes/mnt/azaroth-tech-hive/dist');

app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(3001, '0.0.0.0', () => {
  console.log('SPA server listening on http://0.0.0.0:3001');
});
