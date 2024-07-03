const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = 3000;

// Dummy API URLs
const totalizatorAPIs = [
  'https://api.totalizator1.com/odds',
  'https://api.totalizator2.com/odds',
  'https://api.totalizator3.com/odds'
];

app.use(express.static(path.join(__dirname, 'public')));

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
        // Add more games as needed
      ]
    });
  } catch (error) {
    res.status(500).send('Error fetching odds');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
