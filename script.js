
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

async function displayPrices(code) {
    try {
        const data = await fetchMetalPrice(code);
        
        const priceElement = document.querySelector('.price-value');
        
        if (priceElement) {
            priceElement.textContent = data.price.toFixed(2);
        }
    } catch (error) {
        console.error("Error fetching prices:", error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayPrices('XAU'); 
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
        displayPrices(code);
        console.log(button.dataset.metal);
    });
});