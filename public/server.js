const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.cert')
};

app.get('/totalizator1', (req, res) => {
  res.json({ message: 'Hello from HTTPS server' });
});

https.createServer(options, app).listen(3000, () => {
  console.log('HTTPS server running on port 3000');
});

const corsOptions = {
  origin: "https://bet-filter.vercel.app/",
  optionsSuccessStatus: 200
};

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

app.use(cors(corsOptions)); // Enable CORS for all routes
app.use(express.static(path.join(__dirname, 'public')));

const totalizatorAPIs = [
  'https://api.totalizator1.com/',
  'https://api.totalizator2.com/',
  'https://api.totalizator3.com/'
];

app.get('/api/getOdds', async (req, res) => {
  const game = req.query.game;
  try {
    const promises = totalizatorAPIs.map(api => axios.get(`${api}?game=${game}`));
    const results = await Promise.all(promises);
    const odds = results.map(result => result.data.odds);
    const bestOdds = Math.max(...odds);

    res.json({
      games: [
        {
          name: "Game 1",
          time: "22:45",
          odds1: odds[0],
          oddsX: odds[1],
          odds2: odds[2],
          bestOdds
        }
      ]
    });
  } catch (error) {
    res.status(500).send('Error retrieving odds');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const env = process.env.NODE_ENV || 'development'; // default to 'development' if NODE_ENV is not set
console.log(`The application is running in ${env} mode.`);
