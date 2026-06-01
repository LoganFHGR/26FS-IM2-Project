/*Metals API Gold (bis jetzt)*/

const metalToCode = {
  gold: "XAU",
  silver: "XAG",
  platinum: "XPT",
  palladium: "XPD",
};

const METALS_DEV_API_KEY = "CWFSTV98PJLHWOHXULAB117HXULABdomi";

const METALS = [
  { code: "XAU", name: "Gold" },
  { code: "XAG", name: "Silber" },
  { code: "XPT", name: "Platin" },
  { code: "XPD", name: "Palladium" },
];

const WECHSELKURSE = {
  USD: 1,
  CHF: 0.88,
  EUR: 0.92,
  GBP: 0.79,
};

const EINHEITEN_FAKTOR = {
  KG: 1,
  G: 0.001,
  OZT: 0.0311035,
  GRN: 0.0000648,
};

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

// Fetch historical data for a given metal and date range
async function fetchHistoricalMetalData(metal, startDate, endDate) {
  const url =
    `https://api.metals.dev/v1/timeseries` +
    `?api_key=${METALS_DEV_API_KEY}` +
    `&currency=USD` +
    `&unit=toz` +
    `&start_date=${startDate}` +
    `&end_date=${endDate}`;

  const res = await fetch(url);
  const json = await res.json();

  return json;
}

const cache = {
  XAU: { value: null, lastFetched: null },
  XAG: { value: null, lastFetched: null },
  XPT: { value: null, lastFetched: null },
  XPD: { value: null, lastFetched: null },
};

function calculatePrice(rohPreis) {
  const kurs = WECHSELKURSE[selectedCurrency];
  const einheit = EINHEITEN_FAKTOR[selectedUnit];

  const ergebnis = rohPreis * kurs * einheit;
  return ergebnis;
}

async function displayNewPrices(code) {
  try {
    const data = await fetchMetalPrice(code);
    cache[code].value = data;
    cache[code].lastFetched = Date.now();

    const priceElement = document.querySelector(".price-value");

    if (priceElement) {
      priceElement.textContent = calculatePrice(data.price).toFixed(2);
      console.log("calculated new price");
    }

    // update Bestandesrechner
    renderBestandesrechner();

    // Hide placeholder, show chart
    /*     document.getElementById("chart-placeholder").style.display = "none";
    document.getElementById("priceChart").style.display = "block"; */
  } catch (error) {
    console.error("Error fetching prices:", error);
    // Show placeholder, hide chart while loading
    /*     document.getElementById("chart-placeholder").style.display = "block";
    document.getElementById("priceChart").style.display = "none"; */
  }
}

async function displayCachedPrices(code) {
  try {
    const data = cache[code].value;

    const priceElement = document.querySelector(".price-value");

    if (priceElement) {
      priceElement.textContent = calculatePrice(data.price).toFixed(2);
      console.log("calculated cached price");
    }

    // update Bestandesrechner
    renderBestandesrechner();

    /* // Hide placeholder, show chart
    document.getElementById("chart-placeholder").style.display = "none";
    document.getElementById("priceChart").style.display = "block"; */
  } catch (error) {
    console.error("Error fetching prices:", error);
    /*  document.getElementById("chart-placeholder").style.display = "block";
    document.getElementById("priceChart").style.display = "none"; */
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
    let metall = button.dataset.metal;
    let container = document.getElementById("price-container");
    let metalName = document.querySelector(".metal-name");
    container.className = "price-container-" + metall;

    metalName.textContent = button.querySelector(".metal-icon").textContent;

    //update chart
    updateChart(metall);

    // update global state
    selectedMetal = button.dataset.metal;

    //update Bestandesrechner
    renderBestandesrechner();

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

/* #region Graphen setup */

/* api Fetch */

/* =========================
   GLOBAL STATE
========================= */

let selectedMetal = "gold";
let selectedCurrency = "CHF";
let selectedUnit = "OZT";
let selectedTimeframe = "All";

/* =========================
   CURRENCY SYMBOLS
========================= */

const currencySymbols = {
  USD: "$",
  EUR: "€",
  CHF: "CHF",
  GBP: "£",
};

/* =========================
   Timeframe Buttons
========================= */

const timeframeMap = {
  "1D": "Day",
  "1M": "Month",
  YTD: "YTD",
  All: "All",
};

/* =========================
   Währungs buttons
========================= */

/* =========================
   LOTTIE ANIMATIONEN
========================= */

const animOben = lottie.loadAnimation({
  container: document.getElementById("lottie-btn-oben"),
  renderer: "svg",
  loop: false,
  autoplay: false,
  path: "assets/animations/waehrungs-animation-lottie.json",
});

const animUnten = lottie.loadAnimation({
  container: document.getElementById("lottie-btn-unten"),
  renderer: "svg",
  loop: false,
  autoplay: false,
  path: "assets/animations/waehrungs-animation-lottie.json",
});

// Reihenfolge + zugehörige Frames an EINEM Ort
const WAEHRUNGS_REIHENFOLGE = ["CHF", "USD", "GBP", "EUR"];
const WAEHRUNGS_FRAMES = { CHF: 0, USD: 20, GBP: 40, EUR: 60 };
const END_FRAME = 80; // Frame 80 = CHF (Kreis schliesst sich)

// Wo steht die Animation gerade?
let aktuellerFrame = 0;

// Animation beim Laden auf CHF stellen
animOben.addEventListener("DOMLoaded", () => animOben.goToAndStop(0, true));
animUnten.addEventListener("DOMLoaded", () => animUnten.goToAndStop(0, true));

// Klick auf eine der beiden Animationen → nächste Währung
function naechsteWaehrung() {
  const index = WAEHRUNGS_REIHENFOLGE.indexOf(selectedCurrency);
  const naechste =
    WAEHRUNGS_REIHENFOLGE[(index + 1) % WAEHRUNGS_REIHENFOLGE.length];
  waehrungSetzen(naechste);
}

document
  .getElementById("lottie-btn-oben")
  .addEventListener("click", naechsteWaehrung);
document
  .getElementById("lottie-btn-unten")
  .addEventListener("click", naechsteWaehrung);

/* =========================
   WÄHRUNG SETZEN
========================= */

function waehrungSetzen(waehrung) {
  const zielFrame = WAEHRUNGS_FRAMES[waehrung];

  selectedCurrency = waehrung;

  // Preissymbole aktualisieren
  document.querySelectorAll(".price-currency").forEach((el) => {
    el.textContent = currencySymbols[waehrung];
  });

  // Animation abspielen – immer vorwärts
  [animOben, animUnten].forEach((anim) => {
    if (zielFrame > aktuellerFrame) {
      // normaler Schritt vorwärts (z. B. CHF → USD)
      anim.playSegments([aktuellerFrame, zielFrame], true);
    } else {
      // zurück zu CHF: bis ans Ende spielen (Frame 80 = CHF)
      anim.playSegments([aktuellerFrame, END_FRAME], true);
    }
  });

  // Merker aktualisieren (CHF wird intern als 0 behandelt)
  aktuellerFrame = zielFrame;

  // Chart aktualisieren
  updateChart(selectedMetal);
  displayCachedPrices(metalToCode[selectedMetal]);
  console.log("changed currency to " + waehrung);

  //update Bestandesrechner
  renderBestandesrechner();
}

/* =========================
   Einheits buttons
========================= */

/* =========================
   LOTTIE ANIMATIONEN
========================= */

const animOben2 = lottie.loadAnimation({
  container: document.getElementById("lottie-btn-2-oben"),
  renderer: "svg",
  loop: false,
  autoplay: false,
  path: "assets/animations/einheits-animation-lottie.json",
});

const animUnten2 = lottie.loadAnimation({
  container: document.getElementById("lottie-btn-2-unten"),
  renderer: "svg",
  loop: false,
  autoplay: false,
  path: "assets/animations/einheits-animation-lottie.json",
});

// Reihenfolge + zugehörige Frames an EINEM Ort
const EINHEITEN_REIHENFOLGE = ["OZT", "KG", "G", "GRN"];
const EINHEITEN_FRAMES = { OZT: 0, KG: 20, G: 40, GRN: 60 };
const EINHEITEN_END_FRAME = 80; // Frame 80 = OZT (Kreis schliesst sich)

const einheitsLabels = {
  OZT: " oz",
  KG: " kg",
  G: " g",
  GRN: "grn",
};

// Wo steht die Animation gerade?
let aktuellerFrameEinheiten = 0;

// Animation beim Laden auf OZT stellen
animOben2.addEventListener("DOMLoaded", () => animOben2.goToAndStop(0, true));
animUnten2.addEventListener("DOMLoaded", () => animUnten2.goToAndStop(0, true));

// Klick auf eine der beiden Animationen → nächste Einheit
function naechsteEinheit() {
  const index = EINHEITEN_REIHENFOLGE.indexOf(selectedUnit);
  const naechste =
    EINHEITEN_REIHENFOLGE[(index + 1) % EINHEITEN_REIHENFOLGE.length];
  einheitSetzen(naechste);
}

document
  .getElementById("lottie-btn-2-oben")
  .addEventListener("click", naechsteEinheit);
document
  .getElementById("lottie-btn-2-unten")
  .addEventListener("click", naechsteEinheit);

/* =========================
   EINHEIT SETZEN
========================= */

function einheitSetzen(einheit) {
  const zielFrame = EINHEITEN_FRAMES[einheit];

  selectedUnit = einheit;

  document.querySelectorAll(".unit-label").forEach((el) => {
    el.textContent = einheitsLabels[einheit];
  });

  // Animation abspielen – immer vorwärts
  [animOben2, animUnten2].forEach((anim) => {
    if (zielFrame > aktuellerFrameEinheiten) {
      // normaler Schritt vorwärts (z. B. OZT → KG)
      anim.playSegments([aktuellerFrameEinheiten, zielFrame], true);
    } else {
      // zurück zu OZT: bis ans Ende spielen (Frame 80 = OZT)
      anim.playSegments([aktuellerFrameEinheiten, EINHEITEN_END_FRAME], true);
    }
  });

  // Merker aktualisieren (OZT wird intern als 0 behandelt)
  aktuellerFrameEinheiten = zielFrame;

  // Chart aktualisieren
  updateChart(selectedMetal);
  displayCachedPrices(metalToCode[selectedMetal]);
  console.log("changed unit to " + selectedUnit);

  //update Bestandesrechner
  renderBestandesrechner();
}

/* Graph setup */

//YTD Darstellung
function getYTDRange() {
  const now = new Date();

  return {
    start: `${now.getFullYear()}-01-01`,
    end: now.toISOString().split("T")[0],
  };
}

//Monatliche Darstellung
function getLastMonthRange() {
  const end = new Date();

  const start = new Date();
  start.setMonth(start.getMonth() - 1);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

//Tägliche Darstellung
function getDayRange() {
  const end = new Date();

  const start = new Date();
  start.setDate(start.getDate() - 1);

  return {
    start: start.toISOString().split("T")[0],
    end: end.toISOString().split("T")[0],
  };
}

//Daten umfromen
function transformTimeseriesData(data, metalCode) {
  const labels = [];
  const values = [];

  const sorted = Object.entries(data.rates).sort(
    (a, b) => new Date(a[0]) - new Date(b[0]),
  );

  sorted.forEach(([date, row]) => {
    labels.push(date);
    values.push(row[metalCode]); // XAU / XAG / XPT / XPD
  });

  return { labels, values };
}

//dynamische aktuallisierung der Charts
/* async function updateChartAPI(metal) {
  if (selectedTimeframe === "All") {
    const labels = METAL_YEARLY_HISTORY.labels.All;

    const values = convertArray(METAL_YEARLY_HISTORY[metal]?.USD || []);

    renderChart(labels, values, metal);

    return;
  }

  let range;

  if (selectedTimeframe === "1M") {
    range = getLastMonthRange();
  }

  if (selectedTimeframe === "YTD") {
    range = getYTDRange();
  }

  if (selectedTimeframe === "1D") {
    range = getDayRange();
  }

  const data = await fetchHistoricalMetalData(metal, range.start, range.end);

  const chartData = transformTimeseriesData(data, metal);

  renderChart(chartData.labels, convertArray(chartData.values), metal);
} */

const timeframeButtons = {
  "btn-1t": "1D",
  "btn-1m": "1M",
  "btn-ytd": "YTD",
  "btn-all": "All",
};

Object.entries(timeframeButtons).forEach(([id, timeframe]) => {
  document.getElementById(id).addEventListener("click", () => {
    selectedTimeframe = timeframe;

    console.log("Timeframe:", selectedTimeframe);

    updateChart(selectedMetal);
  });
});

/* ===============================
   YEARLY GOLD AVERAGE DATA
   Source: World Gold Council
   Währungen: USD, EUR, CHF, GBP
================================= */

const monthlyLabels = [];

let year = 1978;
let month = 2;

const METAL_YEARLY_HISTORY = {
  labels: {
    All: monthlyLabels,

    YTD: [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ],

    "1M": [
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "13",
      "14",
      "15",
      "16",
      "17",
      "18",
      "19",
      "20",
      "21",
      "22",
      "23",
      "24",
      "25",
      "26",
      "27",
      "28",
      "29",
      "30",
      "31",
    ],

    "1T": [
      "0h",
      "1h",
      "2h",
      "3h",
      "4h",
      "5h",
      "6h",
      "7h",
      "8h",
      "9h",
      "10h",
      "11h",
      "12h",
      "13h",
      "14h",
      "15h",
      "16h",
      "17h",
      "18h",
      "19h",
      "20h",
      "21h",
      "22h",
      "23h",
    ],
  },

  gold: {
    USD: [
      207.8, 227.3, 245.7, 242.1, 239.2, 257.6, 279.1, 294.7, 300.8, 355.1,
      391.7, 392.0, 455.1, 675.3, 665.3, 553.6, 517.4, 513.8, 600.7, 644.3,
      627.2, 673.6, 661.2, 623.5, 594.9, 557.4, 499.8, 498.8, 495.8, 479.7,
      460.8, 409.3, 410.2, 443.8, 437.8, 413.4, 410.1, 384.1, 374.1, 330.3,
      350.3, 333.8, 315.0, 339.0, 364.2, 437.3, 422.2, 414.9, 444.3, 481.3,
    ],
  },

  silver: {
    USD: [
      4.95, 4.97, 5.35, 5.0, 5.47, 5.28, 5.57, 5.53, 5.67, 6.26, 5.91, 6.02,
      6.71, 7.69, 7.45, 7.65, 8.77, 8.54, 9.08, 10.32, 16.25, 16.6, 19.0, 32.2,
      35.28, 35.52, 13.49, 13.83, 13.7, 16.75, 15.78, 16.06, 20.5, 18.88, 18.42,
    ],
  },

  platinum: {
    USD: [
      205.47, 226.55, 227.09, 214.73, 232.8, 245.6, 251.19, 266.89, 269.84,
      332.17, 327.0, 340.31, 363.75, 411.97, 391.37, 385.9, 428.92, 427.13,
      409.88, 395.93, 464.83, 517.81, 505.75, 601.91, 809.21, 899.92, 764.94,
    ],
  },

  palladium: {
    USD: [
      56.33, 64.66, 63.91, 59.18, 60.51, 59.96, 59.37, 61.75, 61.09, 72.66,
      67.59, 70.23, 77.2, 98.86, 94.27, 93.39, 106.36, 122.26, 119.95, 118.18,
      139.44, 145.59, 141.19, 164.89, 227.06, 270.4, 247.55, 185.52, 158.66,
      171.21, 197.82, 202.42, 213.44, 200.94, 182.73, 155.96, 130.03, 112.89,
      117.29, 108.33, 103.38, 92.56, 84.88, 85.61, 86.78, 77.99, 69.86, 70.35,
    ],
  },
};

// generated months labels for x-axis (1978-2024)

for (let i = 0; i < METAL_YEARLY_HISTORY.gold.USD.length; i++) {
  monthlyLabels.push(`${year}-${String(month).padStart(2, "0")}`);

  month++;

  if (month > 12) {
    month = 1;
    year++;
  }
}

/* Graphen currency conversion */

function convertArray(values) {
  const kurs = WECHSELKURSE[selectedCurrency];
  return values.map((v) => v * kurs);
}

const rootStyles = getComputedStyle(document.documentElement);

const METAL_COLORS = {
  gold: rootStyles.getPropertyValue("--gold").trim(),
  silver: rootStyles.getPropertyValue("--silver").trim(),
  platinum: rootStyles.getPropertyValue("--platinum").trim(),
  palladium: rootStyles.getPropertyValue("--palladium").trim(),
};

const canvas = document.getElementById("priceChart");

let chart; // im äusseren Scope, damit renderChart/updateChart darauf zugreifen

requestAnimationFrame(() => {
  chart = new Chart(canvas, {
    type: "line",
    data: {
      labels: METAL_YEARLY_HISTORY.labels.All,
      datasets: [
        {
          label: "Gold (USD)",
          data: METAL_YEARLY_HISTORY.gold.USD,
          borderColor: METAL_COLORS.gold,
          backgroundColor: "rgba(232,184,74,0.15)",
          borderWidth: 2,
          tension: 0.1,
          fill: true,
          pointRadius: 0.2,
          pointHitRadius: 5,
          pointHoverRadius: 5,
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
        x: {
          ticks: {
            color: "#8888B0",
            maxTicksLimit: 6,
            includeBounds: true,
            callback: function (value) {
              return this.getLabelForValue(value).split("-")[0];
            },
          },
        },
        y: {
          ticks: {
            color: "#8888B0",
          },
        },
      },
    },
  });

  const resizeObserver = new ResizeObserver(() => {
    chart.resize();
  });
  resizeObserver.observe(document.getElementById("graphdisplay"));
});

window.addEventListener("resize", () => {
  chart.resize();
});

function renderChart(labels, values, metal) {
  const colorMap = {
    gold: METAL_COLORS.gold,
    silver: METAL_COLORS.silver,
    platinum: METAL_COLORS.platinum,
    palladium: METAL_COLORS.palladium,
  };

  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.data.datasets[0].label = metal;

  chart.data.datasets[0].borderColor = colorMap[metal];
  chart.data.datasets[0].backgroundColor = colorMap[metal] + "33";

  chart.update();
}

async function updateChart(metal) {
  if (selectedTimeframe === "All") {
    const labels = METAL_YEARLY_HISTORY.labels.All;
    const values = convertArray(METAL_YEARLY_HISTORY[metal]?.USD || []);

    renderChart(labels, values, metal);
    return;
  }

  try {
    let range;

    if (selectedTimeframe === "1M") range = getLastMonthRange();
    if (selectedTimeframe === "YTD") range = getYTDRange();
    if (selectedTimeframe === "1D") range = getDayRange();

    const data = await fetchHistoricalMetalData(
      metalToCode[metal],
      range.start,
      range.end,
    );

    const chartData = transformTimeseriesData(data, metalToCode[metal]);

    renderChart(chartData.labels, convertArray(chartData.values), metal);
  } catch (err) {
    console.error(err);
    document.getElementById("chart-placeholder").style.display = "block";
    document.getElementById("priceChart").style.display = "none";
  }
}

console.log("RAW API DATA:", data);
console.log("RATES:", data.rates);

/* #endregion Graphen setup */

/* #region Toggle Button */

const toggle = document.getElementById("btn-toggle");
const interfaceContainer = document.querySelector(
  ".kaufen_verkaufen_interfacecontainer",
);
const kaufenLabel = document.querySelector(
  ".kaufen_verkaufen_header .kaufen-label",
);
const verkaufenLabel = document.querySelector(
  ".kaufen_verkaufen_header .verkaufen-label",
);
const actionBtn = document.querySelector(".kaufen_verkaufen-btn");

toggle.addEventListener("change", () => {
  const isSelling = toggle.checked;

  actionBtn.textContent = isSelling ? "Verkaufen" : "Kaufen";

  kaufenLabel.style.opacity = isSelling ? "0.5" : "1";
  kaufenLabel.style.fontSize = isSelling ? "var(--fs-sm)" : "var(--fs-md)";

  verkaufenLabel.style.opacity = isSelling ? "1" : "0.5";
  verkaufenLabel.style.fontSize = isSelling ? "var(--fs-md)" : "var(--fs-sm)";

  interfaceContainer.style.background = isSelling
    ? `linear-gradient(rgba(93, 30, 30, 0.25), rgba(42, 16, 16, 0.15)) padding-box,
       linear-gradient(var(--bgcolor1), var(--bgcolor1)) padding-box,
       var(--btn1) border-box`
    : `linear-gradient(rgba(30, 93, 59, 0.25), rgba(16, 42, 28, 0.15)) padding-box,
       linear-gradient(var(--bgcolor1), var(--bgcolor1)) padding-box,
       var(--btn1) border-box`;
});
/* #endregion Toggle Button */

/* #region Bestandesrechner */

function getSafePricePerOz() {
  const key = metalToCode[selectedMetal];
  const data = cache[key]?.value;

  if (typeof data?.price === "number" && !isNaN(data.price)) {
    return data.price;
  }

  return null; // WICHTIG: nicht 0
}

function calculateHoldingValue(amountInput) {
  const amount = parseFloat(amountInput);

  if (isNaN(amount) || amount <= 0) {
    return 0;
  }

  // 1. USD Preis pro oz holen
  const priceUSD = getSafePricePerOz();
  if (!priceUSD) return 0;

  // 2. Umrechnung (USD → CHF/EUR/etc + Einheit)
  const priceConverted =
    priceUSD * WECHSELKURSE[selectedCurrency] * EINHEITEN_FAKTOR[selectedUnit];

  // 3. Menge multiplizieren
  const result = amount * priceConverted;

  console.log(
    `Metal: ${selectedMetal}, Amount: ${amount}, Price: ${priceConverted}, Result: ${result}`,
  );

  return result;
}

function renderBestandesrechner() {
  console.log("🚀 renderBestandesrechner wurde aufgerufen");
  const input = document.querySelector(
    "#bestandsrechner .bestandesrechner-mengeneingabeinput",
  );

  const output = document.querySelector(".mengenwert");

  if (!input || !output) return;

  const result = calculateHoldingValue(input.value);

  output.textContent = result.toFixed(2);

  console.log("Anzeige aktualisiert:", result);
}

/* live input listener */
function initBestandesrechner() {
  const input = document.querySelector(
    "#bestandsrechner .bestandesrechner-mengeneingabeinput",
  );

  if (!input) {
    console.warn("Bestandesrechner Input nicht gefunden!");
    return;
  }

  console.log("INPUT FOUND:", input);

  input.addEventListener("input", (e) => {
    renderBestandesrechner();
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initBestandesrechner);
} else {
  initBestandesrechner();
}
