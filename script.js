/*Metals API Gold (bis jetzt)*/

const METALS_DEV_API_KEY = "CWFSTV98PJLHWOHXULAB117HXULABDOMI";

const METALS = [
  { code: "XAU", name: "Gold" },
  { code: "XAG", name: "Silber" },
  { code: "XPT", name: "Platin" },
  { code: "XPD", name: "Palladium" },
];

async function fetchMetalPrice(code) {
  const codeToName = {
    XAU: "gold",
    XAG: "silver",
    XPT: "platinum",
    XPD: "palladium",
  };
  const metalName = codeToName[code];

  const url = `https://api.metals.dev/v1/latest?api_key=${METALS_DEV_API_KEY}&currency=USD&unit=toz`;
const res = await fetch(url);
const json = await res.json();

const price = json.metals[metalName];

  return { price: price, change: null, changePc: null, gram24k: null };
}
const cache = {
  XAU: { value: null, lastFetched: null },
  XAG: { value: null, lastFetched: null },
  XPT: { value: null, lastFetched: null },
  XPD: { value: null, lastFetched: null },
};

async function displayNewPrices(code) {
  try {
    const data = await fetchMetalPrice(code);
    cache[code].value = data;
    cache[code].lastFetched = Date.now();

    const priceElement = document.querySelector(".price-value");

    if (priceElement) {
      priceElement.textContent = data.price.toFixed(2);
      console.log("Displayed new price");
    }
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

async function displayCachedPrices(code) {
  try {
    const data = cache[code].value;

    const priceElement = document.querySelector(".price-value");

    if (priceElement) {
      priceElement.textContent = data.price.toFixed(2);
      console.log("Displayed cached price");
    }
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

const tenMinutes = 10 * 60 * 1000;

document.addEventListener("DOMContentLoaded", () => {
  if (
    cache.XAU.value === null ||
    Date.now() - cache.XAU.lastFetched > tenMinutes
  ) {
    displayNewPrices("XAU");
  } else {
    displayCachedPrices("XAU");
  }
});

/*Buttons wechseln price-container*/

let buttons = document.querySelectorAll(".metal-btn");

buttons.forEach(function (button) {
  button.addEventListener("click", function () {
    const metalToCode = {
      gold: "XAU",
      silver: "XAG",
      platinum: "XPT",
      palladium: "XPD",
    };

    let metall = button.dataset.metal;
    let container = document.getElementById("price-container");
    let metalName = document.querySelector(".metal-name");
    container.className = "price-container-" + metall;

    metalName.textContent = button.querySelector(".metal-icon").textContent;

  updateChart(metall);


    let code = metalToCode[metall];
    if (
      cache[code].value === null ||
      Date.now() - cache[code].lastFetched > tenMinutes
    ) {
      displayNewPrices(code);
    } else {
      displayCachedPrices(code);
    }
    console.log(button.dataset.metal);
  });
});

/* Graphen setup */

const METAL_HISTORY = {
  gold: [3200, 3250, 3230, 3300, 3350],
  silver: [28, 29, 31, 30, 32],
  platinum: [950, 980, 970, 1000, 1010],
  palladium: [1200, 1180, 1190, 1170, 1210],
};

const rootStyles = getComputedStyle(document.documentElement);

const METAL_COLORS = {
  gold: rootStyles.getPropertyValue("--gold").trim(),
  silver: rootStyles.getPropertyValue("--silver").trim(),
  platinum: rootStyles.getPropertyValue("--platinum").trim(),
  palladium: rootStyles.getPropertyValue("--palladium").trim(),
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

function updateChart(metal) {

  const color = METAL_COLORS[metal];

  chart.data.datasets[0].label =
    metal.charAt(0).toUpperCase() + metal.slice(1);

  chart.data.datasets[0].data = METAL_HISTORY[metal];

  chart.data.datasets[0].borderColor = color;

  chart.data.datasets[0].backgroundColor =
    color + "33";

  chart.update();
}