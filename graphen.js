/* =========================
   METALS API
========================= */

const METALS_DEV_API_KEY = "CWFSTV98PJLHWOHXULAB117HXULABDOMI";

const METAL_CODES = {
  gold: "XAU",
  silver: "XAG",
  platinum: "XPT",
  palladium: "XPD",
};

const METAL_COLORS = {
  gold: "#E8B84A",
  silver: "#CBCBCC",
  platinum: "#CBD8F1",
  palladium: "#DDB3E2",
};



/* =========================
   FETCH PRICE
========================= */

async function fetchMetalPrice(code) {
  const codeToName = {
    XAU: "gold",
    XAG: "silver",
    XPT: "platinum",
    XPD: "palladium",
  };

  const metalName = codeToName[code];

  const url = `https://api.metals.dev/v1/latest?api_key=${METALS_DEV_API_KEY}&currency=USD&unit=toz`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const json = await res.json();

    return json.metals[metalName];
  } catch (err) {
    console.error("API error:", err);
    return null;
  }
}

async function displayPrice(code) {
  const price = await fetchMetalPrice(code);

  const priceElement = document.querySelector(".price-value");
  const placeholder = document.getElementById("chart-placeholder");

  if (priceElement && price) {
    priceElement.textContent = Number(price).toFixed(2);
  }

  if (placeholder) {
    placeholder.style.display = "none";
  }
}


/* =========================
   BUTTONS (METAL SWITCH)
========================= */

document.querySelectorAll(".metal-btn").forEach((button) => {
  button.addEventListener("click", async () => {
    const metal = button.dataset.metal;

    const code = METAL_CODES[metal];

    // update price
    displayPrice(code);

    // update label
    const metalName = document.querySelector(".metal-name");
    if (metalName) {
      metalName.textContent = button.textContent.trim();
    }

    // update container style
    const container = document.getElementById("price-container");
    if (container) {
      container.className = "price-container-" + metal;
    }

    // update chart
    chart.data.datasets[0].data = METAL_HISTORY[metal];
    chart.data.datasets[0].borderColor = METAL_COLORS[metal];
    chart.data.datasets[0].backgroundColor =
      METAL_COLORS[metal] + "33";

    chart.update();
  });
});

/* =========================
   CHART.JS SETUP
========================= */

const METAL_HISTORY = {
  gold: [3200, 3250, 3230, 3300, 3350],
  silver: [28, 29, 31, 30, 32],
  platinum: [950, 980, 970, 1000, 1010],
  palladium: [1200, 1180, 1190, 1170, 1210],
};

const METAL_LABELS = ["Jan", "Feb", "Mar", "Apr", "Mai"];

const canvas = document.getElementById("priceChart");

const chart = new Chart(canvas, {
  type: "line",
  data: {
    labels: METAL_LABELS,
    datasets: [
      {
        label: "Gold",
        data: METAL_HISTORY.gold,
        borderColor: METAL_COLORS.gold,
        backgroundColor: "rgba(232,184,74,0.15)",
        borderWidth: 2,
        tension: 0,
        fill: true,
        pointRadius: 0,
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { ticks: { color: "#8888B0" } },
      y: { ticks: { color: "#8888B0" } },
    },
  },
});




/* =========================
   INIT DEFAULT
========================= */

document.addEventListener("DOMContentLoaded", () => {
  displayPrice("XAU");
});