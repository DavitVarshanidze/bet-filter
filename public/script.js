let selectedBets = [];

async function fetchTotalizatorOdds(game) {
  const totalizatorAPIs = [
    `http://localhost:3000/totalizator1`,
    `http://localhost:3000/totalizator2`,
    `http://localhost:3000/totalizator3`,
  ];

  const totalizatorNames = ["Crystalbet", "Betlive", "Crocobet"];
  const totalizatorUrls = [
    "https://www.crystalbet.com/",
    "https://www.betlive.com/en/home",
    "https://crocobet.com/",
  ];

  try {
    const responses = await Promise.all(totalizatorAPIs.map(url => fetch(url)));

    const oddsData = await Promise.all(
      responses.map(async (response, index) => {
        if (response.ok) {
          const data = await response.json();
          const gameData = data.find(item => item.game === game);
          return {
            totalizator: totalizatorNames[index],
            odds: gameData?.odds ?? "N/A",
            url: totalizatorUrls[index]
          };
        } else {
          console.error(`Error from ${totalizatorNames[index]}: ${response.statusText}`);
          return { totalizator: totalizatorNames[index], odds: "N/A", url: totalizatorUrls[index] };
        }
      })
    );

    return oddsData;
  } catch (error) {
    console.error("Error fetching totalizator odds:", error);
    return totalizatorNames.map((name, index) => ({ totalizator: name, odds: "N/A", url: totalizatorUrls[index] }));
  }
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
    const link = document.createElement("a");
    link.href = offer.totalizator === sortedWinnings[0].totalizator ? offer.url : "#";
    link.textContent = `${offer.totalizator}: ${offer.winnings.toFixed(2)}`;
    link.className = index === 0 ? "winnings-link best-offer" : "winnings-link";
    div.appendChild(link);
    totalPotentialWinningsList.appendChild(div);
  });

  document.getElementById("total-potential-winnings").style.display = "block";
}

async function addToSidebar(game, minOdds, maxOdds) {
  const sidebar = document.getElementById("selected-bets");
  const stakeInput = document.getElementById("stake");
  const stakeValue = parseFloat(stakeInput.value);

  if (isNaN(stakeValue) || stakeValue <= 0) {
    alert("გთხოვთ შეიყვანოთ ფსონი");
    return;
  }

  const existingBetIndex = selectedBets.findIndex(bet => bet.game === game);
  if (existingBetIndex !== -1) {
    sidebar.removeChild(sidebar.children[existingBetIndex]);
    selectedBets.splice(existingBetIndex, 1);
  }

  const avgOdds = (minOdds + maxOdds) / 2;
  const potentialWinnings = (avgOdds * stakeValue).toFixed(2);
  const totalizatorOdds = await fetchTotalizatorOdds(game);

  const betDiv = document.createElement("div");
  betDiv.classList.add("bet");
  betDiv.innerHTML = `
    <div class="bet-header">
      <strong>${game}</strong>
      <strong>კოეფიციენტი:</strong> ${minOdds} - ${maxOdds}<br>
      <button class="remove-bet">X</button>
      <button class="toggle-details">&#42780;</button>
    </div>
    <div class="bet-details">
      <strong>შესაძლო მოგება:</strong> ${potentialWinnings}<br>
      <strong>შეთავაზებები:</strong>
      <ul class="offers">
        ${totalizatorOdds.map(offer => `
          <li><button class="offer-button" data-url="${offer.url}" data-odds="${offer.odds}">${offer.totalizator}: ${offer.odds}</button></li>
        `).join("")}
      </ul>
    </div>
  `;

  const offers = betDiv.querySelectorAll(".offer-button");
  if (offers.length > 0) {
    const bestOffer = [...offers].reduce((best, current) => {
      return parseFloat(current.dataset.odds) > parseFloat(best.dataset.odds) ? current : best;
    });
    bestOffer.classList.add("best-offer");
  }

  betDiv.querySelector(".toggle-details").addEventListener("click", () => {
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