const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const cors = require('cors');
const PORT = process.env.PORT || 3000;
app.use(cors());

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
          name: game,
          odds1: odds[0],
          oddsX: odds[1],
          odds2: odds[2],
          bestOdds
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching odds:', error);
    res.status(500).send('Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
