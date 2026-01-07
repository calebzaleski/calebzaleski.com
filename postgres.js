function addTask(table, task) {
    return fetch('https://postgres.calebzaleski.com/add-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ table, task })
    })
        .then(res => res.json())
        .then(data => {
            console.log('Inserted task:', data);
            return data;
        })
        .catch(err => {
            console.error('Error adding task:', err);
            throw err;
        });
}

// usage example:
addTask('website_list', 'Test task from website');
