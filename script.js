
/*Metals API Gold (bis jetzt)*/

const METALS_DEV_API_KEY = 'CWFSTV98PJLHWOHXULAB117HXULAB';

const METALS =[
    {code: 'XAU', name: 'Gold'},
    {code: 'XAG', name: 'Silber'},
    {code: 'XPT', name: 'Platin'},
    {code: 'XPD', name: 'Palladium'}
]

async function fetchMetalPrice(code) {
    const codeToName = { 'XAU': 'gold', 'XAG': 'silver', 'XPT': 'platinum', 'XPD': 'palladium' };
    const metalName = codeToName[code];

    const url = `https://api.metals.dev/v1/latest?api_key=${METALS_DEV_API_KEY}&currency=USD&unit=toz`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const price = json.metals[metalName];
    
    return { price: price, change: null, changePc: null, gram24k: null };

}
const cache = {
    XAU: {value: null, lastFetched: null},
    XAG: {value: null, lastFetched: null},
    XPT: {value: null, lastFetched: null},
    XPD: {value: null, lastFetched: null}
}

    
async function displayNewPrices(code) {
    try {
        const data = await fetchMetalPrice(code);
        cache[code].value = data;
        cache[code].lastFetched = Date.now();   
        
        const priceElement = document.querySelector('.price-value');
        
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
        
        const priceElement = document.querySelector('.price-value');
        
        if (priceElement) {
            priceElement.textContent = data.price.toFixed(2);
            console.log("Displayed cached price");
        }
    } catch (error) {
        console.error("Error fetching prices:", error);
    }
}


const tenMinutes = 10 * 60 * 1000;

document.addEventListener('DOMContentLoaded', () => {
    if (cache.XAU.value === null || Date.now() - cache.XAU.lastFetched > tenMinutes) {
        displayNewPrices('XAU'); 
    }
    else {
        displayCachedPrices('XAU');
    }
});

/*Buttons wechseln price-container*/

let buttons = document.querySelectorAll('.metal-btn');

buttons.forEach(function(button) {
    button.addEventListener('click', function() {
        const metalToCode = {
            'gold': 'XAU',
            'silver': 'XAG',
            'platinum': 'XPT',
            'palladium': 'XPD'
        }


        let metall = button.dataset.metal
        let container = document.getElementById('price-container');
        let metalName = document.querySelector('.metal-name');
        container.className = 'price-container-' + metall;

        metalName.textContent = button.querySelector('.metal-icon').textContent;
        let code = metalToCode[metall];
        if (cache[code].value === null || Date.now() - cache[code].lastFetched > tenMinutes) {
            displayNewPrices(code); 
        }
         else {
            displayCachedPrices(code);
        }
        console.log(button.dataset.metal);
    });
});