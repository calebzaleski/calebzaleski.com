function addTask(table, task) {
    const url = 'https://postgres.calebzaleski.com/add-task';

    async function postTask(url) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, task })
            });

            const data = await response.json();
            console.log('Inserted task:', data);
            alert(`Task added: "${data.inserted.task}" (completed: ${data.inserted.completed})`);

        } catch (err) {
            console.error('Error adding task:', err);
            alert('Failed to add task');
        }
    }

    postTask(url);
}
// Attach click event to button


// usage example:
