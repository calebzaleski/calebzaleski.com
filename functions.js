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


/*function MQTT (elementId) {
    const client = new Paho.MQTT.Client("192.168.1.30", 9001, "client_" + Math.random().toString(16).substr(2, 8));

    client.onMessageArrived = function (message) {
        document.getElementById(elementId).textContent = message.payloadString;
    };

    client.connect({
        onSuccess: function () {
            client.subscribe("Soil_Sensor/topic");
        }
    });
} */

/*async function Quote(elementId) {
    const api_url = "http://localhost:3001/quote"; // Docker container endpoint

    try {
        const response = await fetch(api_url);
        const data = await response.json();

        // Update the page with the quote
        document.getElementById(elementId).textContent = `"${data.quote}" — ${data.author}`;
    } catch (error) {
        console.error("Error fetching quote:", error);
        document.getElementById(elementId).textContent = "Quote unavailable.";
    }
} */

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

