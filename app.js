/*Metals API Gold (bis jetzt)*/

async function displayNewPrices(code) {
  try {
    const data = await fetchMetalPrice(code);
    cache[code].value = data;
    cache[code].lastFetched = Date.now();

    const priceElement = document.querySelector(".price-value");
    if (priceElement) {
      let finalPrice = calculatePrice(data.price);

      if (finalPrice > 0 && finalPrice < 0.01) {
        finalPrice = 0.01;
      }

      priceElement.textContent = finalPrice.toFixed(2);
      console.log("calculated news price");
    }
    renderBestandesrechner();
  } catch (error) {
    console.error("Error fetching prices:", error);
  }
}

async function displayCachedPrices(code) {
  try {
    const data = cache[code].value;

    const priceElement = document.querySelector(".price-value");

    if (priceElement) {
      let finalPrice = calculatePrice(data.price);

      if (finalPrice > 0 && finalPrice < 0.01) {
        finalPrice = 0.01;
      }

      priceElement.textContent = finalPrice.toFixed(2);
      console.log("calculated cached price");
    }

    renderBestandesrechner();
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
    let metall = button.dataset.metal;
    let container = document.getElementById("price-container");
    let metalName = document.querySelector(".metal-name");
    container.className = "price-container-" + metall;

    metalName.textContent = button.querySelector(".metal-icon").textContent;

    let graph = document.querySelector(".graph");

    graph.classList.remove(
      "graph-gold",
      "graph-silver",
      "graph-platinum",
      "graph-palladium",
    );

    graph.classList.add(`graph-${metall}`);

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
  "1W": "Week",
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

/*==========================
    Graph setup
  ========================== */

//Daten umfromen
function transformTimeseriesData(data, metalCode) {
  const labels = [];
  const values = [];

  const sorted = Object.entries(data.rates).sort(
    (a, b) => new Date(a[0]) - new Date(b[0]),
  );

  sorted.forEach(([date, row]) => {
    labels.push(date);
  });

  return { labels, values };
}

const timeframeButtons = {
  "btn-1W": "1W",
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
          borderColor: METAL_COLORS[selectedMetal],
          backgroundColor: METAL_COLORS[selectedMetal] + "33",
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
          type: "category",
          ticks: {
            color: "#8888B0",
            maxTicksLimit: 6,
            includeBounds: true,
            callback: function (value) {
              const label = this.getLabelForValue(value);
              if (selectedTimeframe === "All") return label.split("-")[0]; // just year
              if (selectedTimeframe === "YTD") return label.slice(5); // MM-DD
              if (selectedTimeframe === "1M") return label.slice(5); // MM-DD
              if (selectedTimeframe === "1W") return label.slice(5); // MM-DD
              return label;
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

  const color = colorMap[metal];
  
  chart.data.labels = labels;
  chart.data.datasets[0].data = values;
  chart.data.datasets[0].label = metal;
  chart.data.datasets[0].borderColor = color;
  chart.data.datasets[0].backgroundColor = color + "33";

  chart.update();
}

async function updateChart(metal) {
  if (selectedTimeframe === "All") {
    const labels = METAL_YEARLY_HISTORY.labels.All;
    const values = convertArray(METAL_YEARLY_HISTORY[metal]?.USD || []);
    renderChart(labels, values, metal);
    return;
  }

  // hide chart, show loading message before fetching
  document.getElementById("chart-placeholder").style.display = "block";
  document.getElementById("priceChart").style.display = "none";
  document.getElementById("chart-placeholder").textContent = "Ladet Daten…";

  try {
    const { labels, values } = await fetchTimeseriesData(
      metal,
      selectedTimeframe,
    );

    // hide placeholder, show chart
    document.getElementById("chart-placeholder").style.display = "none";
    document.getElementById("priceChart").style.display = "block";

    renderChart(labels, convertArray(values), metal);
    chart.resize();
  } catch (err) {
    console.error("Chart error:", err);
    document.getElementById("chart-placeholder").style.display = "block";
    document.getElementById("priceChart").style.display = "none";
  }
}

/* console.log("RAW API DATA:", data);
console.log("RATES:", data.rates);
 */
/* #endregion Graphen setup */

/* #region Toggle Button */

const toggle = document.getElementById("btnToggle");
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

/* =========================
   COIN FLIP ANIMATION
========================= */

const coinFlipAnim = lottie.loadAnimation({
  container: document.getElementById("coin-flip-overlay"),
  renderer: "svg",
  loop: false,
  autoplay: false,
  path: "assets/animations/coin-flip.json",
});

const amountInput = document.querySelector(".mengeneingabeinput");

function playCoinFlip() {
  const overlay = document.getElementById("coin-flip-overlay");
  const text = document.getElementById("coin-flip-text");
  const buyBtn = document.querySelector(".kaufen_verkaufen-btn");

  // hide button during animation
  buyBtn.style.opacity = "0";

  // show animation + text
  overlay.style.display = "block";
  text.classList.add("show");

  // example: run Lottie
  coinFlipAnim.goToAndPlay(0, true);
}

actionBtn.addEventListener("click", () => {
  const overlay = document.getElementById("coin-flip-overlay");
  const text = document.getElementById("coin-flip-text");

  actionBtn.style.opacity = "0";

  overlay.style.display = "block";
  text.style.opacity = "1";

  coinFlipAnim.stop();
  coinFlipAnim.goToAndPlay(0, true);
});

coinFlipAnim.addEventListener("complete", () => {
  document.getElementById("coin-flip-overlay").style.display = "none";
  document.getElementById("coin-flip-text").style.opacity = "0";
  actionBtn.style.opacity = "1";
  amountInput.value = "";
});

/* #region Bestandesrechner */

function renderBestandesrechner() {
  console.log("renderBestandesrechner wurde aufgerufen");
  const input = document.querySelector(
    "#bestandsrechner .bestandesrechner-mengeneingabeinput",
  );

  const output = document.querySelector(".mengenwert");

  if (!input || !output) return;

  let result = calculateHoldingValue(input.value);

  const inputAmount = parseFloat(input.value);
  if (inputAmount > 0 && result < 0.01) {
    result = 0.01;
  }

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
