const fs = require('fs');
const https = require('https');
const jsonServer = require('json-server');

const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // Enable CORS for all origins

// Your existing routes and server setup


server.use(middlewares);
server.use(router);

// Use paths relative to the location of server.js
const httpsOptions = {
  key: fs.readFileSync('./key.pem'),
  cert: fs.readFileSync('./cert.pem'),
};

https.createServer(httpsOptions, server).listen(3000, () => {
  console.log('JSON Server is running on https://localhost:3000');
});
