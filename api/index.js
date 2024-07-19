const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

const data = {
  totalizator1: [
    { game: "ესპანეთი vs გერმანია", odds: "3.10" },
    { game: "პორტუგალია vs საფრანგეთი", odds: "1.39" },
    { game: "ჰოლანდია vs თურქეთი", odds: "4.68" },
    { game: "ინგლისი vs შვეიცარია", odds: "4.68" }
  ],
  totalizator2: [
    { game: "ესპანეთი vs გერმანია", odds: "3.08" },
    { game: "პორტუგალია vs საფრანგეთი", odds: "1.38" },
    { game: "ჰოლანდია vs თურქეთი", odds: "4.70" },
    { game: "ინგლისი vs შვეიცარია", odds: "4.70" }
  ],
  totalizator3: [
    { game: "ესპანეთი vs გერმანია", odds: "3.05" },
    { game: "პორტუგალია vs საფრანგეთი", odds: "1.40" },
    { game: "ჰოლანდია vs თურქეთი", odds: "4.65" },
    { game: "ინგლისი vs შვეიცარია", odds: "4.65" }
  ]
};

app.get('/totalizator1', (req, res) => {
  res.json(data.totalizator1);
});

app.get('/totalizator2', (req, res) => {
  res.json(data.totalizator2);
});

app.get('/totalizator3', (req, res) => {
  res.json(data.totalizator3);
});

app.listen(port, () => {
  console.log(`API running on port ${port}`);
});
