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
    div.textContent = `${offer.totalizator}: ${offer.winnings.toFixed(2)}`;
    if (index === 0) {
      div.style.width = "130px";
      div.style.border = "3px solid green";
    }
    totalPotentialWinningsList.appendChild(div);
  });

  document.getElementById("total-potential-winnings").style.display = "block";
}

// Add selected bet to the sidebar
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
      <strong>კოეფიციენტი:</strong> ${minOdds} - ${maxOdds}
    </div>
    <div class="bet-details">
      <strong>ფსონი:</strong> ${stakeValue}<br>
      <strong>შესაძლო მოგება:</strong> ${potentialWinnings}<br>
      <strong>შეთავაზებები:</strong>
      <ul class="offers">
        ${totalizatorOdds.map(offer => `
          <li><button class="offer-button" data-url="${offer.url}">${offer.totalizator}: ${offer.odds}</button></li>
        `).join("")}
      </ul>
      <button class="remove-bet">წაშლა</button>
    </div>
  `;

  betDiv.addEventListener("click", () => {
    const details = betDiv.querySelector(".bet-details");
    details.style.display = details.style.display === "none" ? "block" : "none";
  });

  betDiv.querySelector(".remove-bet").addEventListener("click", (event) => {
    event.stopPropagation(); // Prevent triggering the toggle
    sidebar.removeChild(betDiv);
    selectedBets = selectedBets.filter(bet => bet.game !== game);
    updateTotalPotentialWinnings();
  });

  betDiv.querySelectorAll(".offer-button").forEach(button => {
    button.addEventListener("click", (event) => {
      event.stopPropagation(); // Prevent triggering the toggle
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
