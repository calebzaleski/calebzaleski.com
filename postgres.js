function addTask() {
    const url = 'https://postgres.calebzaleski.com/add-task';
    const task = document.getElementById('taskInput').value;
    const table = document.getElementById('tableSelect').value;

    if (!task.trim()) {
        alert('Please enter a task');
        return;
    }

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
            document.getElementById('taskInput').value = ''; // Clear input

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
            return data.tasks; // Return after getting the data
        } catch (err) {
            console.error('Error fetching tasks:', err);
            alert('Failed to fetch tasks');
            return []; // Return empty array on error
        }
    }

    return fetch_tasks(url);
}

//this renders the function above to be able to use in a .html
async function handleFetchClick() {
    const tasks = await fetch_all('website_list');
    document.getElementById('website_list').innerHTML = tasks.map(task =>
        `<p>${task.task}</p>`
    ).join('');
}