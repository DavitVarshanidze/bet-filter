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

// total potential winnings
function updateTotalPotentialWinnings() {
  const stakeValue = parseFloat(document.getElementById("stake").value);
  if (isNaN(stakeValue) || stakeValue <= 0) {
    document.getElementById("total-potential-winnings").style.display = "none";
    return;
  }

  const totalPotentialWinningsList = document.getElementById("total-potential-winnings-list");
  totalPotentialWinningsList.innerHTML = ""; // clear existing list

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
      div.style.border = "3px solid green";
      div.style.width = "130px";
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
    alert("გთხოვთ შეიყვანოთ ფსონი");
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
      <strong>კოეფიციენტი:</strong> ${minOdds} - ${maxOdds}<br>
    </div>
    <div>
      <strong>შეთავაზებები:</strong>
      <ul class="offers">
        ${totalizatorOdds.map(offer => `
          <li><button class="offer-button" data-url="${offer.url}">${offer.totalizator}: ${offer.odds}</button></li>
        `).join("")}
      </ul>
    </div>
    <button class="remove-bet">წაშლა</button>
  `;

  betDiv.querySelector(".remove-bet").addEventListener("click", () => {
    sidebar.removeChild(betDiv);
    selectedBets = selectedBets.filter(bet => bet.game !== game);
    updateTotalPotentialWinnings();
  });

  betDiv.querySelectorAll(".offer-button").forEach(button => {
    button.addEventListener("click", () => {
      window.open(button.dataset.url, "_blank");
    });
  });

  sidebar.appendChild(betDiv);

  selectedBets.push({ game, avgOdds, totalizatorOdds });

  updateTotalPotentialWinnings();
}

document.querySelectorAll(".odds-display button").forEach((button) => {
  button.addEventListener("click", (event) => {
    const game = event.target.dataset.game;
    const minOdds = parseFloat(event.target.dataset.minOdds);
    const maxOdds = parseFloat(event.target.dataset.maxOdds);
    addToSidebar(game, minOdds, maxOdds);
  });
});

document.getElementById("stake").addEventListener("input", updateTotalPotentialWinnings);

document.getElementById("increase-stake").addEventListener("click", () => {
  const stakeInput = document.getElementById("stake");
  stakeInput.value = (parseFloat(stakeInput.value) + 0.01).toFixed(2);
  updateTotalPotentialWinnings();
});

document.getElementById("decrease-stake").addEventListener("click", () => {
  const stakeInput = document.getElementById("stake");
  const newValue = parseFloat(stakeInput.value) - 0.01;
  stakeInput.value = newValue > 0 ? newValue.toFixed(2) : "0.01";
  updateTotalPotentialWinnings();
});