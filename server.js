const jsonServer = require('json-server');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

// Use CORS middleware
server.use(cors());

// Use default middlewares (logger, static, and no-cache)
server.use(middlewares);

// Add custom routes if needed

// Use JSON Server router
server.use(router);

// Start server
server.listen(3000, () => {
  console.log('JSON Server is running on http://localhost:3000');
});
