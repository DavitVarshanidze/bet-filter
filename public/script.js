async function fetchTotalizatorOdds(game) {
  const totalizatorAPIs = [
    // Use HTTPS for secure connections
    // Uncomment the following lines if your server is configured to use HTTPS
    `https://localhost:3000/totalizator1`,
    `https://localhost:3000/totalizator2`,
    `https://localhost:3000/totalizator3`,
  
    // Use HTTP if you are not using HTTPS
    // `http://localhost:3000/totalizator1`,
    // `http://localhost:3000/totalizator2`,
    // `http://localhost:3000/totalizator3`,
  ];
  
  async function fetchTotalizatorOdds(game) {
    try {
      const responses = await Promise.all(totalizatorAPIs.map(url => fetch(url)));
  
      const oddsData = await Promise.all(
        responses.map(async (response, index) => {
          if (response.ok) {
            const data = await response.json();
            const gameData = data.find(item => item.game === game);
            return {
              totalizator: `Totalizator ${index + 1}`,
              odds: gameData?.odds ?? "N/A",
              url: `https://www.example${index + 1}.com/`
            };
          } else {
            console.error(`Error from Totalizator ${index + 1}: ${response.statusText}`);
            return { totalizator: `Totalizator ${index + 1}`, odds: "N/A", url: `https://www.example${index + 1}.com/` };
          }
        })
      );
  
      return oddsData;
    } catch (error) {
      console.error("Error fetching totalizator odds:", error);
      return totalizatorAPIs.map((_, index) => ({ totalizator: `Totalizator ${index + 1}`, odds: "N/A", url: `https://www.example${index + 1}.com/` }));
    }
  }
  
  fetch('https://localhost:3000/api/getOdds?game=someGame')
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
  
}

function updateTotalPotentialWinnings() {
  const stakeValue = parseFloat(document.getElementById("stake").value);
  if (isNaN(stakeValue) || stakeValue <= 0) {
    document.getElementById("total-potential-winnings").style.display = "none";
    return;
  }

  const totalPotentialWinningsList = document.getElementById("total-potential-winnings-list");
  totalPotentialWinningsList.innerHTML = ""; 

  const totalizatorWinnings = {};

  selectedBets.forEach(bet => {
    bet.totalizatorOdds.forEach(offer => {
      if (!totalizatorWinnings[offer.totalizator]) {
        totalizatorWinnings[offer.totalizator] = { totalizator: offer.totalizator, winnings: stakeValue };
      }
      totalizatorWinnings[offer.totalizator].winnings *= parseFloat(offer.odds);
    });
  });

  const sortedWinnings = Object.values(totalizatorWinnings).sort((a, b) => b.winnings - a.winnings);

  sortedWinnings.forEach((offer, index) => {
    const div = document.createElement("div");
    div.textContent = `${offer.totalizator}: ${offer.winnings.toFixed(2)}`;
    if (index === 0) {
      div.style.width = "130px";
      div.style.border = "3px solid green";
    }
    totalPotentialWinningsList.appendChild(div);
  });

  document.getElementById("total-potential-winnings").style.display = "block";
}

async function addToSidebar(game, minOdds, maxOdds) {
  const sidebar = document.getElementById("selected-bets");
  const stakeInput = document.getElementById("stake");
  const stakeValue = parseFloat(stakeInput.value);

  if (isNaN(stakeValue) || stakeValue <= 0) {
    alert("Please enter a valid stake.");
    return;
  }

  const avgOdds = (minOdds + maxOdds) / 2;
  const potentialWinnings = (avgOdds * stakeValue).toFixed(2);
  const totalizatorOdds = await fetchTotalizatorOdds(game);

  const betDiv = document.createElement("div");
  betDiv.classList.add("bet");
  betDiv.innerHTML = `
    <div>
      <strong>${game}</strong><br>
      <strong>Odds:</strong> ${minOdds} - ${maxOdds}
    </div>
    <div class="bet-details">
      <strong>Offers:</strong>
      <ul class="offers">
        ${totalizatorOdds.map(offer => `
          <li><button class="offer-button" data-url="${offer.url}">${offer.totalizator}: ${offer.odds}</button></li>
        `).join("")}
      </ul>
      <button class="remove-bet">Remove</button>
    </div>
  `;

  betDiv.addEventListener("click", () => {
    const details = betDiv.querySelector(".bet-details");
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  betDiv.querySelector(".remove-bet").addEventListener("click", (event) => {
    event.stopPropagation(); 
    sidebar.removeChild(betDiv);
    selectedBets = selectedBets.filter(bet => bet.game !== game);
    updateTotalPotentialWinnings();
  });

  betDiv.querySelectorAll(".offer-button").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      window.open(button.dataset.url, "_blank");
    });
  });

  sidebar.appendChild(betDiv);

  selectedBets.push({ game, totalizatorOdds });
  updateTotalPotentialWinnings();
}

document.querySelectorAll(".odds-display button").forEach(button => {
  button.addEventListener("click", async () => {
    const game = button.dataset.game;
    const minOdds = parseFloat(button.dataset.minOdds);
    const maxOdds = parseFloat(button.dataset.maxOdds);
    await addToSidebar(game, minOdds, maxOdds);
  });
});

document.getElementById("decrease-stake").addEventListener("click", () => {
  const stakeInput = document.getElementById("stake");
  const currentStake = parseFloat(stakeInput.value);
  if (currentStake > 0.01) {
    stakeInput.value = (currentStake - 0.01).toFixed(2);
    updateTotalPotentialWinnings();
  }
});

document.getElementById("increase-stake").addEventListener("click", () => {
  const stakeInput = document.getElementById("stake");
  const currentStake = parseFloat(stakeInput.value);
  stakeInput.value = (currentStake + 0.01).toFixed(2);
  updateTotalPotentialWinnings();
});

document.getElementById("stake").addEventListener("change", () => {
  updateTotalPotentialWinnings();
});

// Ensure that `fetch` uses HTTPS and handle CORS issues
fetch('https://localhost:3000/api/getOdds?game=someGame')
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));
