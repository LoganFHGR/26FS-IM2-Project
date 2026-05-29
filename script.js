/*Metals API Gold (bis jetzt)*/

const metalToCode = {
  gold: "XAU",
  silver: "XAG",
  platinum: "XPT",
  palladium: "XPD",
};

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

    // Hide placeholder, show chart
    document.getElementById("chart-placeholder").style.display = "none";
    document.getElementById("priceChart").style.display = "block";
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

    //update chart
    updateChart(metall);

    // update global state
    selectedMetal = button.dataset.metal;

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

/* =========================
   GLOBAL STATE
========================= */

let selectedMetal = "gold";
let selectedCurrency = "CHF";
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
   CURRENCY BUTTONS
========================= */

const currencyButtons = document.querySelectorAll(".btn-waerung");

currencyButtons.forEach((button) => {
  button.addEventListener("click", () => {
    // remove active class
    currencyButtons.forEach((btn) => btn.classList.remove("active"));

    // activate clicked button
    button.classList.add("active");

    // set currency
    selectedCurrency = button.innerText === "EURO" ? "EUR" : button.innerText;

    // update currency symbol
    document.getElementById("price-currency").textContent =
      currencySymbols[selectedCurrency];

    // update chart
    updateChart(selectedMetal);

    // update live price
    const code = metalToCode[selectedMetal];
  });
});

/* ====================
  TIMEFRAME BUTTONS 
  =====================*/

const timeframeButtons = document.querySelectorAll(".btn-zeitspanne");

timeframeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    timeframeButtons.forEach((btn) => btn.classList.remove("active"));

    button.classList.add("active");

    selectedTimeframe = button.innerText;

    updateChart(selectedMetal);
  });
});

/* ===============================
   YEARLY GOLD AVERAGE DATA
   Source: World Gold Council
   Währungen: USD, EUR, CHF, GBP
================================= */

const METAL_YEARLY_HISTORY = {
  labels: {
    All: [
      1978, 1979, 1980, 1981, 1982, 1983, 1984, 1985, 1986, 1987, 1988, 1989,
      1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001,
      2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
      2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025,
    ],

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

    Month: [
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

    Day: [
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
    CHF: [
      507.33, 507.33, 1027.54, 900.98, 765.1, 763.06, 572.71, 692.98, 621.25,
      688.84, 662.64, 635.07, 548.35, 514.48, 459.84, 509.39, 523.78, 462.96,
      485.77, 476.92, 436.41, 414.55, 458.55, 449.71, 466.16, 492.14, 510.95,
      555.14, 734.63, 822.74, 940.97, 1047.44, 1274.67, 1434.13, 1564.46,
      1307.16, 1158.66, 1134.05, 1233.16, 1240.95, 1242.08, 1369.42, 1670.71,
      1645.27, 1687.84, 1744.25, 2099.82, 2836.23,
    ],

    GBP: [
      100.65, 143.09, 263.8, 227.02, 215.53, 279.24, 250.25, 240.89, 249.8,
      273.15, 244.74, 233.03, 209.5, 205.84, 194.81, 239.77, 250.56, 243.67,
      248.09, 202.84, 177.66, 171.21, 184.42, 187.23, 206.13, 222.84, 223.0,
      243.8, 327.44, 341.15, 471.15, 607.46, 791.65, 989.16, 1053.2, 904.44,
      762.65, 749.54, 923.44, 974.73, 950.44, 1092.04, 1377.25, 1312.94,
      1481.34, 1560.71, 1865.53, 2598.68,
    ],

    USD: [
      193.44, 304.68, 614.5, 459.26, 375.3, 423.66, 360.48, 317.26, 367.87,
      446.46, 436.94, 381.44, 383.51, 362.11, 343.82, 359.77, 384.0, 384.07,
      387.81, 331.29, 294.24, 278.88, 279.11, 271.04, 309.73, 363.38, 409.17,
      444.74, 603.46, 695.39, 871.96, 972.35, 1224.53, 1571.52, 1668.98,
      1411.23, 1266.06, 1160.06, 1248.69, 1257.12, 1268.49, 1392.6, 1769.64,
      1798.61, 1800.09, 1940.54, 2386.2, 3431.54,
    ],

    EUR: [
      124.74, 185.06, 378.19, 360.91, 345.6, 439.17, 434.71, 288.67, 313.07,
      275.53, 381.53, 314.94, 303.87, 290.59, 266.09, 309.22, 301.72, 297.07,
      300.83, 291.27, 264.82, 261.81, 302.94, 302.69, 326.5, 321.23, 329.98,
      357.51, 480.8, 507.74, 594.9, 697.24, 922.44, 1129.76, 1299.76, 1062.94,
      952.78, 1045.82, 1128.05, 1113.79, 1073.48, 1244.11, 1548.84, 1520.72,
      1708.86, 1794.95, 2205.52, 3028.52,
    ],
  },
  silver: {
    CHF: [
      507.33, 507.33, 1027.54, 900.98, 765.1, 763.06, 572.71, 692.98, 621.25,
      688.84, 662.64, 635.07, 548.35, 514.48, 459.84, 509.39, 523.78, 462.96,
      485.77, 476.92, 436.41, 414.55, 458.55, 449.71, 466.16, 492.14, 510.95,
      555.14, 734.63, 822.74, 940.97, 1047.44, 1274.67, 1434.13, 1564.46,
      1307.16, 1158.66, 1134.05, 1233.16, 1240.95, 1242.08, 1369.42, 1670.71,
      1645.27, 1687.84, 1744.25, 2099.82, 2836.23,
    ],

    GBP: [
      100.65, 143.09, 263.8, 227.02, 215.53, 279.24, 250.25, 240.89, 249.8,
      273.15, 244.74, 233.03, 209.5, 205.84, 194.81, 239.77, 250.56, 243.67,
      248.09, 202.84, 177.66, 171.21, 184.42, 187.23, 206.13, 222.84, 223.0,
      243.8, 327.44, 341.15, 471.15, 607.46, 791.65, 989.16, 1053.2, 904.44,
      762.65, 749.54, 923.44, 974.73, 950.44, 1092.04, 1377.25, 1312.94,
      1481.34, 1560.71, 1865.53, 2598.68,
    ],

    USD: [
      193.44, 304.68, 614.5, 459.26, 375.3, 423.66, 360.48, 317.26, 367.87,
      446.46, 436.94, 381.44, 383.51, 362.11, 343.82, 359.77, 384.0, 384.07,
      387.81, 331.29, 294.24, 278.88, 279.11, 271.04, 309.73, 363.38, 409.17,
      444.74, 603.46, 695.39, 871.96, 972.35, 1224.53, 1571.52, 1668.98,
      1411.23, 1266.06, 1160.06, 1248.69, 1257.12, 1268.49, 1392.6, 1769.64,
      1798.61, 1800.09, 1940.54, 2386.2, 3431.54,
    ],

    EUR: [
      124.74, 185.06, 378.19, 360.91, 345.6, 439.17, 434.71, 288.67, 313.07,
      275.53, 381.53, 314.94, 303.87, 290.59, 266.09, 309.22, 301.72, 297.07,
      300.83, 291.27, 264.82, 261.81, 302.94, 302.69, 326.5, 321.23, 329.98,
      357.51, 480.8, 507.74, 594.9, 697.24, 922.44, 1129.76, 1299.76, 1062.94,
      952.78, 1045.82, 1128.05, 1113.79, 1073.48, 1244.11, 1548.84, 1520.72,
      1708.86, 1794.95, 2205.52, 3028.52,
    ],
  },
  platinum: {
    CHF: [
      507.33, 507.33, 1027.54, 900.98, 765.1, 763.06, 572.71, 692.98, 621.25,
      688.84, 662.64, 635.07, 548.35, 514.48, 459.84, 509.39, 523.78, 462.96,
      485.77, 476.92, 436.41, 414.55, 458.55, 449.71, 466.16, 492.14, 510.95,
      555.14, 734.63, 822.74, 940.97, 1047.44, 1274.67, 1434.13, 1564.46,
      1307.16, 1158.66, 1134.05, 1233.16, 1240.95, 1242.08, 1369.42, 1670.71,
      1645.27, 1687.84, 1744.25, 2099.82, 2836.23,
    ],

    GBP: [
      100.65, 143.09, 263.8, 227.02, 215.53, 279.24, 250.25, 240.89, 249.8,
      273.15, 244.74, 233.03, 209.5, 205.84, 194.81, 239.77, 250.56, 243.67,
      248.09, 202.84, 177.66, 171.21, 184.42, 187.23, 206.13, 222.84, 223.0,
      243.8, 327.44, 341.15, 471.15, 607.46, 791.65, 989.16, 1053.2, 904.44,
      762.65, 749.54, 923.44, 974.73, 950.44, 1092.04, 1377.25, 1312.94,
      1481.34, 1560.71, 1865.53, 2598.68,
    ],

    USD: [
      193.44, 304.68, 614.5, 459.26, 375.3, 423.66, 360.48, 317.26, 367.87,
      446.46, 436.94, 381.44, 383.51, 362.11, 343.82, 359.77, 384.0, 384.07,
      387.81, 331.29, 294.24, 278.88, 279.11, 271.04, 309.73, 363.38, 409.17,
      444.74, 603.46, 695.39, 871.96, 972.35, 1224.53, 1571.52, 1668.98,
      1411.23, 1266.06, 1160.06, 1248.69, 1257.12, 1268.49, 1392.6, 1769.64,
      1798.61, 1800.09, 1940.54, 2386.2, 3431.54,
    ],

    EUR: [
      124.74, 185.06, 378.19, 360.91, 345.6, 439.17, 434.71, 288.67, 313.07,
      275.53, 381.53, 314.94, 303.87, 290.59, 266.09, 309.22, 301.72, 297.07,
      300.83, 291.27, 264.82, 261.81, 302.94, 302.69, 326.5, 321.23, 329.98,
      357.51, 480.8, 507.74, 594.9, 697.24, 922.44, 1129.76, 1299.76, 1062.94,
      952.78, 1045.82, 1128.05, 1113.79, 1073.48, 1244.11, 1548.84, 1520.72,
      1708.86, 1794.95, 2205.52, 3028.52,
    ],
  },
  palladium: {
    CHF: [
      507.33, 507.33, 1027.54, 900.98, 765.1, 763.06, 572.71, 692.98, 621.25,
      688.84, 662.64, 635.07, 548.35, 514.48, 459.84, 509.39, 523.78, 462.96,
      485.77, 476.92, 436.41, 414.55, 458.55, 449.71, 466.16, 492.14, 510.95,
      555.14, 734.63, 822.74, 940.97, 1047.44, 1274.67, 1434.13, 1564.46,
      1307.16, 1158.66, 1134.05, 1233.16, 1240.95, 1242.08, 1369.42, 1670.71,
      1645.27, 1687.84, 1744.25, 2099.82, 2836.23,
    ],

    GBP: [
      100.65, 143.09, 263.8, 227.02, 215.53, 279.24, 250.25, 240.89, 249.8,
      273.15, 244.74, 233.03, 209.5, 205.84, 194.81, 239.77, 250.56, 243.67,
      248.09, 202.84, 177.66, 171.21, 184.42, 187.23, 206.13, 222.84, 223.0,
      243.8, 327.44, 341.15, 471.15, 607.46, 791.65, 989.16, 1053.2, 904.44,
      762.65, 749.54, 923.44, 974.73, 950.44, 1092.04, 1377.25, 1312.94,
      1481.34, 1560.71, 1865.53, 2598.68,
    ],

    USD: [
      193.44, 304.68, 614.5, 459.26, 375.3, 423.66, 360.48, 317.26, 367.87,
      446.46, 436.94, 381.44, 383.51, 362.11, 343.82, 359.77, 384.0, 384.07,
      387.81, 331.29, 294.24, 278.88, 279.11, 271.04, 309.73, 363.38, 409.17,
      444.74, 603.46, 695.39, 871.96, 972.35, 1224.53, 1571.52, 1668.98,
      1411.23, 1266.06, 1160.06, 1248.69, 1257.12, 1268.49, 1392.6, 1769.64,
      1798.61, 1800.09, 1940.54, 2386.2, 3431.54,
    ],

    EUR: [
      124.74, 185.06, 378.19, 360.91, 345.6, 439.17, 434.71, 288.67, 313.07,
      275.53, 381.53, 314.94, 303.87, 290.59, 266.09, 309.22, 301.72, 297.07,
      300.83, 291.27, 264.82, 261.81, 302.94, 302.69, 326.5, 321.23, 329.98,
      357.51, 480.8, 507.74, 594.9, 697.24, 922.44, 1129.76, 1299.76, 1062.94,
      952.78, 1045.82, 1128.05, 1113.79, 1073.48, 1244.11, 1548.84, 1520.72,
      1708.86, 1794.95, 2205.52, 3028.52,
    ],
  },
};

const rootStyles = getComputedStyle(document.documentElement);

const METAL_COLORS = {
  gold: rootStyles.getPropertyValue("--gold").trim(),
  silver: rootStyles.getPropertyValue("--silver").trim(),
  platinum: rootStyles.getPropertyValue("--platinum").trim(),
  palladium: rootStyles.getPropertyValue("--palladium").trim(),
};

const canvas = document.getElementById("priceChart");

const chart = new Chart(canvas, {
  type: "line",
  data: {
    labels: METAL_YEARLY_HISTORY.labels.All,
    datasets: [
      {
        label: "Gold (USD)",
        data: METAL_YEARLY_HISTORY.gold.CHF,
        borderColor: METAL_COLORS.gold,
        backgroundColor: "rgba(232,184,74,0.15)",
        borderWidth: 2,
        tension: 0,
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
          maxTicksLimit: 10,
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

function changeCurrency(currency) {
  selectedCurrency = currency;

  const activeMetal =
    document.querySelector(".metal-btn.active")?.dataset.metal || "gold";

  updateChart(activeMetal);
}

function updateChart(metal) {
  const color = METAL_COLORS[metal];
  chart.data.labels = METAL_YEARLY_HISTORY.labels[selectedTimeframe];
  chart.data.datasets[0].label = metal.charAt(0).toUpperCase() + metal.slice(1);
  chart.data.datasets[0].data = METAL_YEARLY_HISTORY[metal][selectedCurrency];
  chart.data.datasets[0].borderColor = color;
  chart.data.datasets[0].backgroundColor = color + "33";
  chart.update();
}
