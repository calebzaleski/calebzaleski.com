function addTask(elementId, table, task) {
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
function fetch_all(table) {
    const url = 'https://postgres.calebzaleski.com/fetch_all';

    async function fetch_tasks(url) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table })
            });

            const data = await response.json();
            console.log('All tasks:', data.tasks);
            data.tasks.forEach(task => {
                console.log(`Task: "${task.task}" | Completed: ${task.completed}`);
            });
        } catch (err) {
            console.error('Error fetching tasks:', err);
            alert('Failed to fetch tasks');
        }
    }

    fetch_tasks(url);
}
