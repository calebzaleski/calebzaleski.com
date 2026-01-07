function addNumber(num) {
    return fetch('https://postgres.calebzaleski.com/add-number', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ num })
    })
        .then(res => res.json())
        .then(data => {
            console.log('Inserted row:', data);
            return data;
        })
        .catch(err => {
            console.error(err);
            throw err;
        });
}

// usage
