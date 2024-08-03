const fs = require('fs');
const https = require('https');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); 


server.use(middlewares);
server.use(router);

const httpsOptions = {
  key: fs.readFileSync('./localhost-key.pem'),
  cert: fs.readFileSync('./localhost.pem'),
};

https.createServer(httpsOptions, server).listen(3000, () => {
  console.log('JSON Server is running on https://localhost:3000');
});
