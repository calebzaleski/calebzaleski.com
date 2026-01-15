/**
 * tasklist.js
 *
 * This file contains client-side JavaScript functions that interact with a backend
 * service hosted at https://postgres.calebzaleski.com. The backend is responsible
 * for managing task lists stored in a PostgreSQL database.
 *
 * The major functions in this file are:
 * - addTask: Adds a new task to a specified table in the backend.
 * - updateTask: Updates the completion status of a task in a specified table.
 * - fetch_all: Fetches all tasks/items from a specified table.
 * - handleFetchWebsite: Fetches tasks from the 'website_list' table and renders them as checkboxes in the DOM.
 * - handleFetchThreeDPrinting: Fetches items from the 'threedprinting_list' table and renders them as paragraphs in the DOM.
 */

/**
 * Adds a new task to a specified table in the backend.
 *
 * @returns {void}
 *
 * Side Effects:
 * - Sends a POST request to the backend to add the task.
 * - Alerts the user on success or failure.
 * - Clears the input field on success.
 * - Inserts the new task into the DOM immediately after successful addition.
 */
async function addTask(table) {
    // Backend URL for adding a task
    const url = 'https://postgres.calebzaleski.com/add-task';
    // Retrieve task input value from DOM
    const task = document.getElementById('taskInput').value;
    // Retrieve selected table name from DOM
    console.log('addTask called with value:', JSON.stringify(task));

    // Validate input: ensure task is not empty or whitespace
    if (!task.trim()) {
        alert('Please enter a task');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({table, task})
        });

        const data = await response.json();
        console.log('AddTask response:', data);

        if (!data.inserted || !data.inserted.id) {
            return alert('Backend did not return a valid inserted task');
        }

        document.getElementById('taskInput').value = '';

        const container = document.getElementById(table);
        if (!container) {
            console.error(`Container with id '${table}' not found`);
            return;
        }
        const label = document.createElement('label');
        label.dataset.id = data.inserted.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = data.inserted.completed;
        checkbox.addEventListener('change', () => updateTask(table, data.inserted.id, checkbox.checked));

        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(data.inserted.task));

        container.appendChild(label);

    } catch (err) {
        console.error('Error adding task:', err);
        alert('Failed to add task');
    }
}


/**
 * Updates the completion status of a task in a specified table.
 *
 * NOTE: Modified to accept 'id' instead of 'task' and send { table, id, completed } in the POST body.
 * The 'id' is the primary key / unique identifier for tasks/items.
 *
 * @param {string} table - The name of the table containing the task.
 * @param {number|string} id - The unique identifier of the task to update.
 * @param {boolean} completed - The new completion status of the task.
 * @returns {void}
 *
 * Side Effects:
 * - Sends a POST request to update the task in the backend.
 * - Alerts the user on failure.
 */
function updateTask(table, id, completed) {
    // Backend URL for updating a task
    const url = 'https://postgres.calebzaleski.com/update_task';

    /**
     * Sends a POST request to update the task's completion status.
     *
     * @param {string} url - The endpoint to send the request to.
     * @returns {Promise<void>}
     */
    async function postUpdate(url) {
        try {
            // Send POST request with JSON payload containing table, id, and completed status
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({table, id, completed}) // Changed from task to id
            });
            // No need to parse the JSON response here
        } catch (err) {
            // Log error and alert user of failure
            console.error('Error updating task:', err);
            alert('Failed to update task');
        }
    }

    // Initiate the POST request to update the task
    postUpdate(url);
}


function submitTask(table) {
    return fetch('https://postgres.calebzaleski.com/delete_completed_tasks', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({table})
    });
}


/**
 * Fetches all tasks/items from a specified table.
 *
 * @param {string} table - The name of the table to fetch tasks from.
 * @returns {Promise<Array>} - A promise that resolves to an array of tasks/items.
 *
 * Side Effects:
 * - Sends a POST request to fetch tasks from the backend.
 * - Alerts the user on failure.
 */
function fetch_all(table) {
    // Backend URL for fetching all tasks/items
    const url = 'https://postgres.calebzaleski.com/fetch_all';

    /**
     * Sends a POST request to fetch tasks from the backend.
     *
     * @param {string} url - The endpoint to send the request to.
     * @returns {Promise<Array>} - Resolves to an array of tasks/items.
     */
    async function fetch_tasks(url) {
        try {
            // Send POST request with JSON payload containing the table name
            const response = await fetch(url, {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({table})
            });

            // Parse JSON response to get tasks
            const data = await response.json();

            // Return the array of tasks/items
            return data.tasks;
        } catch (err) {
            // Log error and alert user of failure
            console.error('Error fetching tasks:', err);
            alert('Failed to fetch tasks');

            // Return empty array on error to prevent further issues
            return [];
        }
    }

    // Return the promise resolving to the fetched tasks/items
    return fetch_tasks(url);
}

async function genericFetchHandler(table) {
    const tasks = await fetch_all(table);
    const container = document.getElementById(table);

    if (!container) {
        console.error(`Container with id '${table}' not found`);
        return;
    }

    container.innerHTML = tasks.map(task =>
        `<label data-id="${task.id}">
        <input
            type="checkbox"
            ${task.completed ? 'checked' : ''}
            onchange="updateTask('${table}', ${task.id}, this.checked)">
        ${task.task}
    </label>`
    ).join('');
}

//this is where the init starts
function initTodoPage(table, fetchHandler = genericFetchHandler) {
    const taskInput = document.getElementById("taskInput");
    const addTaskBtn = document.getElementById("addTaskBtn");
    const deleteCompletedBtn = document.getElementById("deleteCompletedBtn");

    console.log('Init called with table:', table);
    console.log("initTodoPage called", {
        taskInput: !!taskInput,
        addTaskBtn: !!addTaskBtn,
        deleteCompletedBtn: !!deleteCompletedBtn
    });

    if (!taskInput || !addTaskBtn || !deleteCompletedBtn) {
        console.warn("Todo elements not found on this page. Skipping init.");
        return;
    }

    addTaskBtn.addEventListener('click', () => console.log('AddTask clicked'));
    deleteCompletedBtn.addEventListener('click', () => console.log('DeleteTask clicked'));

    async function refresh() {
        await fetchHandler(table);
    }

    addTaskBtn.onclick = async () => {
        console.log('Add button clicked, table:', table);
        await addTask(table);
        console.log('Task added, refreshing...');
        await refresh();
    };

    deleteCompletedBtn.onclick = async () => {
        await submitTask(table);
        await refresh();
    };

    taskInput.addEventListener("keydown", async (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            await addTask(table);
            await refresh();
        }
    });

    // Initial load
    refresh();
}