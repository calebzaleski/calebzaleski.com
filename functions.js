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


function MQTT (elementId) {
    const client = new Paho.MQTT.Client("192.168.1.30", 9001, "client_" + Math.random().toString(16).substr(2, 8));

    client.onMessageArrived = function (message) {
        document.getElementById(elementId).textContent = message.payloadString;
    };

    client.connect({
        onSuccess: function () {
            client.subscribe("Soil_Sensor/topic");
        }
    });
}



