/*Metals API Gold (bis jetzt)*/

const metalToCode = {
  gold: "XAU",
  silver: "XAG",
  platinum: "XPT",
  palladium: "XPD",
};

const METALS_DEV_API_KEY = "CWFSTV98PJLHWOHXULAB117HXULABdomi ";

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
  GRN: " grain",
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
    CHF: [
      378.8, 410.6, 407.3, 410.5, 445.4, 474.5, 486.1, 498.5, 571.4, 637.1,
      643.9, 739.8, 1076.1, 1091.1, 975.8, 907.0, 854.9, 981.3, 1038.1, 1035.0,
      1104.9, 1099.6, 1078.2, 1063.3, 1015.5, 978.3, 960.1, 979.1, 993.0, 955.4,
      857.9, 889.9, 898.5, 823.7, 737.6, 744.2, 708.6, 708.8, 623.7, 687.5,
      652.6, 654.3, 707.6, 765.8, 937.3, 917.9, 910.3, 914.7, 951.0, 996.9,
      869.2, 890.9, 900.6, 872.4, 895.7, 900.5, 892.1, 832.9, 827.6, 853.3,
      829.6, 852.0, 848.4, 835.5, 855.6, 863.3, 836.7, 840.2, 851.4, 858.1,
      842.3, 817.4, 804.8, 840.4, 847.9, 840.0, 825.9, 813.6, 764.1, 757.0,
      752.4, 706.2, 692.4, 675.4, 712.5, 662.5, 659.0, 646.3, 634.9, 630.6,
      608.4, 624.9, 689.2, 696.3, 672.2, 651.1, 638.8, 617.4, 628.2, 654.4,
      677.1, 678.5, 691.7, 709.1, 691.1, 694.2, 645.1, 648.1, 642.9, 615.9,
      612.9, 625.3, 636.4, 659.4, 670.7, 683.3, 651.7, 624.7, 615.8, 619.2,
      632.0, 610.4, 626.9, 632.8, 642.9, 627.1, 608.7, 605.7, 610.2, 598.5,
      638.2, 643.4, 621.8, 620.0, 594.4, 556.3, 523.8, 501.9, 504.4, 516.3,
      508.6, 487.8, 479.5, 483.6, 487.4, 461.5, 504.3, 515.9, 519.8, 560.7,
      569.7, 541.4, 517.1, 530.1, 516.8, 500.8, 497.8, 515.2, 519.7, 513.7,
      502.5, 485.4, 470.4, 445.6, 440.9, 453.4, 478.6, 475.0, 486.1, 500.4,
      501.8, 498.8, 532.9, 549.2, 594.1, 567.4, 503.7, 524.6, 559.5, 562.2,
      568.9, 556.1, 549.0, 543.0, 539.4, 529.8, 510.4, 501.2, 505.0, 493.2,
      498.1, 504.1, 486.9, 478.6, 447.1, 444.6, 451.0, 448.3, 446.2, 458.8,
      455.0, 438.8, 440.7, 451.1, 471.4, 484.0, 473.7, 479.6, 491.6, 484.5,
      472.8, 466.0, 472.1, 479.4, 481.7, 489.5, 493.9, 504.3, 515.4, 503.3,
      492.0, 491.4, 480.0, 490.0, 474.9, 471.6, 430.5, 415.5, 426.4, 435.1,
      440.8, 463.6, 441.9, 436.8, 443.1, 425.1, 404.7, 395.7, 407.2, 396.1,
      397.5, 410.0, 419.1, 423.2, 416.3, 401.8, 396.7, 387.1, 403.5, 463.0,
      455.9, 397.9, 410.1, 419.0, 422.8, 416.4, 401.6, 396.2, 387.3, 403.9,
      463.3, 455.9, 448.1, 452.4, 489.7, 476.3, 465.4, 472.6, 469.3, 464.7,
      470.9, 480.8, 478.8, 473.1, 459.4, 432.6, 436.7, 444.9, 446.0, 477.5,
      482.4, 470.4, 457.6, 463.2, 462.4, 455.8, 455.7, 470.2, 501.5, 492.3,
      500.4, 499.3, 493.6, 461.4, 464.1, 476.8, 472.5, 467.7, 479.2, 490.7,
      488.4, 463.4, 452.0, 465.4, 470.0, 477.2, 496.5, 520.7, 501.4, 519.2,
      515.3, 513.4, 503.9, 519.3, 523.2, 492.0, 490.5, 495.4, 505.2, 511.7,
      518.9, 514.2, 507.5, 501.1, 504.0, 509.5, 513.2, 513.8, 545.6, 549.5,
      553.0, 577.5, 605.3, 625.3, 665.1, 702.0, 724.5, 726.9, 782.5, 822.6,
      734.2, 783.8, 779.3, 744.1, 738.0, 775.4, 760.8, 784.9, 823.5, 797.9,
      822.9, 814.7, 808.2, 803.2, 800.4, 844.4, 886.4, 905.4, 914.5, 978.8,
      1004.4, 979.6, 922.8, 928.4, 922.2, 965.9, 909.0, 920.2, 921.6, 907.1,
      936.7, 968.3, 1097.8, 1068.0, 1021.6, 1027.1, 1022.2, 1007.4, 1014.3,
      1035.9, 1065.9, 1141.0, 1167.2, 1155.3, 1174.4, 1186.9, 1228.5, 1364.6,
      1387.6, 1257.0, 1264.1, 1272.4, 1299.9, 1349.5, 1349.5, 1299.4, 1303.5,
      1308.1, 1326.4, 1321.4, 1284.6, 1293.2, 1368.3, 1544.8, 1492.6, 1578.6,
      1540.6, 1553.3, 1589.0, 1527.9, 1506.0, 1490.1, 1528.2, 1557.6, 1574.8,
      1638.8, 1629.0, 1616.1, 1557.6, 1543.8, 1499.3, 1507.5, 1390.6, 1351.6,
      1252.4, 1215.7, 1247.5, 1246.1, 1188.3, 1164.9, 1094.3, 1125.4, 1162.4,
      1176.0, 1146.7, 1144.7, 1145.7, 1177.0, 1178.9, 1159.8, 1164.7, 1134.3,
      1171.5, 1177.3, 1148.2, 1155.1, 1150.4, 1116.9, 1101.2, 1078.3, 1082.2,
      1093.5, 1122.8, 1096.6, 1063.2, 1106.1, 1189.8, 1223.3, 1197.0, 1232.3,
      1237.2, 1313.5, 1302.1, 1291.5, 1250.6, 1231.4, 1172.6, 1201.4, 1236.7,
      1233.6, 1266.7, 1228.0, 1219.9, 1187.5, 1238.5, 1265.8, 1256.5, 1271.0,
      1245.6, 1279.1, 1244.8, 1255.6, 1293.3, 1298.8, 1268.8, 1232.0, 1187.3,
      1160.4, 1208.4, 1222.0, 1238.8, 1278.5, 1322.1, 1301.7, 1296.6, 1297.4,
      1342.6, 1396.0, 1467.0, 1496.9, 1484.6, 1460.2, 1451.7, 1513.4, 1559.7,
      1526.1, 1634.2, 1664.2, 1648.2, 1719.9, 1792.6, 1758.7, 1733.7, 1697.6,
      1649.1, 1655.7, 1623.3, 1597.7, 1621.0, 1672.2, 1665.3, 1658.3, 1631.4,
      1639.8, 1640.1, 1678.4, 1646.1, 1669.7, 1712.4, 1811.0, 1828.1, 1810.9,
      1780.8, 1684.1, 1689.5, 1639.3, 1657.2, 1663.3, 1675.7, 1754.9, 1716.5,
      1770.8, 1795.4, 1787.2, 1748.7, 1702.1, 1685.8, 1723.4, 1728.7, 1768.1,
      1760.1, 1747.6, 1775.5, 1917.0, 2125.7, 2138.2, 2078.2, 2136.6, 2118.5,
      2175.2, 2317.2, 2334.2, 2352.9, 2464.2, 2614.3, 2635.6, 2680.6, 2721.9,
      2727.1, 2666.5, 2710.0, 2918.8, 3233.6, 3280.0, 3421.6, 3744.5, 3878.6,
      3825.6, 3715.2,
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

function updateChart(metal) {
  const timeframe = selectedTimeframe === "All" ? "All" : selectedTimeframe;
  const labels =
    METAL_YEARLY_HISTORY.labels[timeframe] || METAL_YEARLY_HISTORY.labels.All;
  const metalData = METAL_YEARLY_HISTORY[metal];
  const values = metalData?.[selectedCurrency] || metalData?.USD || [];

  renderChart(labels, values, metal);
}

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
    `Metal: ${selectedMetal}, Amount: ${amount}, Price: ${priceConverted}, Result: ${result}`
  );

  return result;
}

function renderBestandesrechner() {
  console.log("🚀 renderBestandesrechner wurde aufgerufen");
  const input = document.querySelector(
  "#bestandsrechner .bestandesrechner-mengeneingabeinput"
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
    "#bestandsrechner .bestandesrechner-mengeneingabeinput"
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
