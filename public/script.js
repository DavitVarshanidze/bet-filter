async function fetchTotalizatorOdds(game) {
  const encodedGame = encodeURIComponent(game);
  const totalizatorAPIs = [
    `http://localhost:3000/totalizator1?game=${encodedGame}`,
    `http://localhost:3000/totalizator2?game=${encodedGame}`,
    `http://localhost:3000/totalizator3?game=${encodedGame}`
  ];

  const totalizatorNames = [
    'Crystalbet',
    'Europebet',
    'Crocobet'
  ];

  try {
    const responses = await Promise.all(totalizatorAPIs.map(url => {
      console.log('Fetching from URL:', url);
      return fetch(url);
    }));

    const oddsData = await Promise.all(responses.map(async response => {
      console.log('Response from API:', response);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched data:', data);
        return data;
      } else {
        console.error('Error in response:', response.statusText);
        return [];
      }
    }));

    console.log('Fetched odds data:', oddsData);

    return oddsData.map((data, index) => {
      console.log(`Data from ${totalizatorNames[index]}:`, data);
      return {
        totalizator: totalizatorNames[index],
        odds: data.length > 0 && data[0].odds ? data[0].odds : 'N/A'
      };
    });
  } catch (error) {
    console.error('Error fetching totalizator odds:', error);
    return [];
  }
}

async function addToSidebar(game, minOdds, maxOdds) {
  const sidebar = document.getElementById('selected-bets');
  const avgOdds = (minOdds + maxOdds) / 2;
  const stake = 10;
  const potentialWinnings = (avgOdds * stake).toFixed(2);
  const totalizatorOdds = await fetchTotalizatorOdds(game);

  console.log('Totalizator Odds:', totalizatorOdds);

  const betDiv = document.createElement('div');
  betDiv.classList.add('bet');
  betDiv.innerHTML = `
    <div>
      <strong></strong> ${game}<br></br>
    </div>
    <div>
      <strong>კოეფიციენტი:</strong> ${minOdds} - ${maxOdds}
    </div>
    <div>
      <strong>შესაძლო მოგება:</strong> ${potentialWinnings}
    </div>
    <div>
      <strong>შეთავაზებები:</strong>
      <ul class="kushi">
        ${totalizatorOdds.map(offer => `
          <li>${offer.totalizator}: ${offer.odds}</li>
        `).join('')}
      </ul>
    </div>
    <button class="remove-bet">წაშლა</button>
  `;

  betDiv.querySelector('.remove-bet').addEventListener('click', () => {
    sidebar.removeChild(betDiv);
  });

  sidebar.appendChild(betDiv);
}

document.querySelectorAll('.odds-display button').forEach(button => {
  button.addEventListener('click', (event) => {
    const game = event.target.dataset.game;
    const minOdds = parseFloat(event.target.dataset.minOdds);
    const maxOdds = parseFloat(event.target.dataset.maxOdds);
    console.log('Button clicked for game:', game, 'Min odds:', minOdds, 'Max odds:', maxOdds);
    addToSidebar(game, minOdds, maxOdds);
  });
});
