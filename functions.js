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
