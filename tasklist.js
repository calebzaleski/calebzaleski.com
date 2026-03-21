/**
 * tasklist.js
 *
 * Secure, generic client-side task list handler.
 *
 * This file contains client-side JavaScript functions that interact with a backend
 * service hosted at https://postgres.calebzaleski.com. The backend manages task lists
 * stored in a PostgreSQL database.
 *
 * 🔐 Security notes:
 * - All user input is sanitized client-side via `sanitizeInput()` to mitigate XSS.
 * - Tasks are rendered using programmatic DOM APIs (`createElement`, `createTextNode`)
 *   instead of `innerHTML`, preventing DOM-based XSS.
 * - No inline event handlers are used; all events are attached with `addEventListener`.
 *
 * Core functions:
 * - sanitizeInput: Escapes unsafe characters from user input.
 * - addTask: Adds a new task to a specified backend table.
 * - updateTask: Updates completion state of a task by ID.
 * - fetch_all: Fetches all tasks for a table from the backend.
 * - genericFetchHandler: Safely renders tasks for any table.
 * - initTodoPage: Wires a page to a task table and fetch handler.
 */

/**
 * Sanitizes user-provided input to reduce XSS risk.
 *
 * NOTE:
 * - This is a defense-in-depth measure.
 * - Backend must still escape or sanitize input independently.
 *
 * @param {string} input - Raw user input
 * @returns {string} - Escaped and trimmed string safe for rendering
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return '';
    return input
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .trim();
}

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
 * - Sanitizes user input before sending it to the backend.
 */
async function addTask(table, wrapper) {
    // Backend URL for adding a task
    const url = 'https://proxy.calebzaleski.com/add-task';
    // Retrieve task input value from wrapper
    const inputEl = wrapper.querySelector('.taskInput');
    const task = sanitizeInput(inputEl ? inputEl.value : '');
    console.log('addTask called with value:', JSON.stringify(task));

    // Validate input: ensure task is not empty or whitespace
    if (!task.trim()) {
        alert('Please enter a task');
        return;
    }

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({table, task})
        });
        const data = await response.json();
        console.log('AddTask response:', data);

        if (!data.inserted) {
            return alert('Backend did not return a valid inserted task');
        }

        if (inputEl) inputEl.value = '';

        // We don't need to manually create labels/checkboxes here
        // because refresh() is called immediately after in initTodoPage

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
    const url = 'https://proxy.calebzaleski.com/update-task';

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
                headers: {
                    'Content-Type': 'application/json'
                },
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
    return fetch('https://proxy.calebzaleski.com/delete-completed-tasks', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
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
    const url = 'https://postgrespull.calebzaleski.com/fetch_all';

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

/**
 * Fetches and renders tasks for a given table using safe DOM operations.
 *
 * Security:
 * - Does NOT use innerHTML.
 * - Uses createElement / createTextNode to prevent XSS.
 *
 * @param {string} table - Backend table name and DOM container ID
 * @returns {Promise<void>}
 */
async function genericFetchHandler(table) {
    const tasks = await fetch_all(table);
    const container = document.getElementById(table);

    if (!container) {
        console.error(`Container with id '${table}' not found`);
        return;
    }

    // Clear existing content safely
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    tasks.forEach(task => {
        const label = document.createElement('label');
        label.dataset.id = task.id;

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = !!task.completed;
        checkbox.addEventListener('change', () => {
            updateTask(table, task.id, checkbox.checked);
        });

        const textNode = document.createTextNode(task.task);

        label.appendChild(checkbox);
        label.appendChild(textNode);
        container.appendChild(label);
    });
}

//this is where the init starts
// Modified to accept wrapper element and table id, and scope queries to the wrapper
function initTodoPage(wrapper, table, fetchHandler = genericFetchHandler) {
    const taskInput = wrapper.querySelector(".taskInput");
    const addTaskBtn = wrapper.querySelector(".addTaskBtn");
    const deleteCompletedBtn = wrapper.querySelector(".deleteCompletedBtn");

    console.log('Init called with table:', table);
    console.log("initTodoPage called", {
        taskInput: !!taskInput,
        addTaskBtn: !!addTaskBtn,
        deleteCompletedBtn: !!deleteCompletedBtn
    });

    if (!taskInput || !addTaskBtn || !deleteCompletedBtn) {
        console.warn("Todo elements not found in wrapper. Skipping init.");
        return;
    }

    addTaskBtn.addEventListener('click', () => console.log('AddTask clicked'));
    deleteCompletedBtn.addEventListener('click', () => console.log('DeleteTask clicked'));

    async function refresh() {
        await fetchHandler(table);
    }

    addTaskBtn.onclick = async () => {
        console.log('Add button clicked, table:', table);
        await addTask(table, wrapper);
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
            await addTask(table, wrapper);
            await refresh();
        }
    });

    // Initial load
    refresh();
}

async function readOnlyFetchHandler(table) {
    const tasks = await fetch_all(table);
    const container = document.getElementById(table);

    if (!container) {
        console.error(`Container with id '${table}' not found`);
        return;
    }

    // Clear existing content
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Create a UL for bullet points
    const list = document.createElement('ul');

    tasks.forEach(task => {
        const li = document.createElement('li');
        li.dataset.id = task.id;

        const textNode = document.createTextNode(task.task);
        li.appendChild(textNode);

        list.appendChild(li);
    });

    container.appendChild(list);
}

function initROTodoPage(table, fetchHandler = readOnlyFetchHandler){
    console.log('Init Read-Only page called with table:', table);

    async function refresh() {
        try {
            await fetchHandler(table);
            console.log('Read-only data loaded successfully.');
        } catch (error) {
            console.error("Error loading read-only data:", error);
        }
    }

    // Initial load only - no event listeners or button logic
    refresh();
}