
/*Metals API Gold (bis jetzt)*/

const METALS_DEV_API_KEY = 'CWFSTV98PJLHWOHXULAB117HXULABDOMI';

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

async function displayPrices() {
    try {
        const goldData = await fetchMetalPrice('XAU');
        console.log("Fetched Gold Data:", goldData);
        
        const priceElement = document.querySelector('.price-value');
        
        if (priceElement) {
            priceElement.textContent = goldData.price.toFixed(2);
        }
    } catch (error) {
        console.error("Error fetching prices:", error);
    }
}

document.addEventListener('DOMContentLoaded', displayPrices);

/*Buttons wechseln price-container*/

