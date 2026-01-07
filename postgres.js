// attach to window so onclick can find it
async function addTask(table, task) {
    try {
        const res = await fetch('https://postgres.calebzaleski.com/add-task', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ table, task })
        });
        const data = await res.json();
        console.log('Inserted task:', data);
        alert(`Task added: ${data.inserted.task}`);
    } catch (err) {
        console.error('Error adding task:', err);
        alert('Failed to add task');
    }
}

// Attach click event to button


// usage example:
