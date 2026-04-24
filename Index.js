function loadNavbar() {
    fetch('navbar.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('navbar').innerHTML = data;
        });
}

loadNavbar();

function CurTime() {
    const d = new Date()
    return d.toLocaleTimeString();
}

function QOTD(elementId) {
    const url = "https://quoteoftheday.calebzaleski.com/daily_quote";

    async function getapi(url)
    {
        const response = await fetch(url);
        var data = await response.json();
        console.log(data);

        document.getElementById(elementId).textContent =
            `"${data.quote.quote}" — ${data.quote.author}`;
    }

    getapi(url);
}

function VOTD(elementId) {
    const url = 'https://beta.ourmanna.com/api/v1/get?format=json&order=daily';

    async function getapi(url)
    {
        const response = await fetch(url);
        var data = await response.json();
        console.log(data);

        const text = data.verse.details.text;
        const reference = data.verse.details.reference;
        const version = data.verse.details.version;

        document.getElementById(elementId).textContent =
            `"${text}" — ${reference} (${version})`;
    }

    getapi(url);
}

function NOTD(elementId) {
    const url = 'https://noas.calebzaleski.com/no';

    async function getapi(url)
    {
        const response = await fetch(url);
        var data = await response.json();
        console.log(data);

       const no = data.reason;

        document.getElementById(elementId).textContent =
            `"${no}"`;
    }

    getapi(url);
}

function Stock(symbol) {
    const url = `https://proxy.calebzaleski.com/stock/${symbol}`;

    async function getapi(url)
    {
        const response = await fetch(url);
        var data = await response.json();
        console.log(data);

        const price = data?.["Global Quote"]?.["05. price"];

        const displayPrice = !isNaN(parseFloat(price)) ? parseFloat(price).toFixed(1) : 'N/A';
        document.getElementById(symbol).textContent =
            `${symbol}: $${displayPrice}`;
    }

    getapi(url);
}

function ranphonetic() {

    const phoneticAlphabet = [
        'Alpha',
        'Bravo',
        'Charlie',
        'Delta',
        'Echo',
        'Foxtrot',
        'Golf',
        'Hotel',
        'India',
        'Juliett',
        'Kilo',
        'Lima',
        'Mike',
        'November',
        'Oscar',
        'Papa',
        'Quebec',
        'Romeo',
        'Sierra',
        'Tango',
        'Uniform',
        'Victor',
        'Whiskey',
        'X-ray',
        'Yankee',
        'Zulu'
    ];

   let item = Math.floor(Math.random() * 26);
   let letter = phoneticAlphabet[item];
    console.log(letter[0]);
   let completed = false
   let iterations = 0;
   let score = 0;

    while (!completed) {
        let userword = prompt(`Please enter the word for the letter corresponding to '${letter[0]}': `);

        if (userword.trim().toLowerCase() === null) {
            alert(`The answer was ${phoneticAlphabet[item]}`);
            break;
        }

        if (userword.trim().toLowerCase() === phoneticAlphabet[item].toLowerCase()) {
            alert("Correct!");
            completed = true;
            return 1;
        }

        else {
            iterations++;
            if (iterations >= 2) {
                alert(`The answer was ${phoneticAlphabet[item]}`);
                return 0;

            }
            else {
                alert("Try again!");
            }

        }
    }
}

function askTimes() {
    let times = parseInt(prompt("How many questions would you like?"), 10);
    let score = 0;

    if (!isNaN(times) && times > 0) {
        for (let i = 0; i < times; i++) {
            score += ranphonetic()
        }
    }
    alert(`your score is ${score}/${times}`)
}
