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
    const url = "https://api.allorigins.win/raw?url=https://zenquotes.io/api/today";

    async function getapi(url)
    {
        const response = await fetch(url);
        var data = await response.json();
        console.log(data);

        document.getElementById(elementId).textContent =
            ' "' + data[0].q + '" — ' + data[0].a;

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

