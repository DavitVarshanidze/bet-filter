const express = require('express');
const fs = require('fs');
const https = require('https');
const path = require('path');

const app = express();
const PORT = 3000;

const sslOptions = {
  key: fs.readFileSync('./server.key'),
  cert: fs.readFileSync('./server.cert'),
};

app.use(express.static(path.join(__dirname, 'public')));

app.get('/totalizator1', (req, res) => {
  res.json({ message: 'Hello from HTTPS server' });
});

app.get('/api/getOdds', (req, res) => {
  res.json({ message: 'Odds data' });
});

https.createServer(sslOptions, app).listen(PORT, () => {
  console.log(`HTTPS server running on port ${PORT}`);
});
