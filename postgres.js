/**
 * postgres.js
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
function addTask() {
    // Backend URL for adding a task
    const url = 'https://postgres.calebzaleski.com/add-task';
    // Retrieve task input value from DOM
    const task = document.getElementById('taskInput').value;
    // Retrieve selected table name from DOM
    const table = document.getElementById('tableSelect').value;

    // Validate input: ensure task is not empty or whitespace
    if (!task.trim()) {
        alert('Please enter a task');
        return;
    }

     /**
     * Sends a POST request to add the task to the backend.
     *
     * @param {string} url - The endpoint to send the request to.
     * @returns {Promise<void>}
     */
    async function postTask(url) {
        try {
            // Send POST request with JSON payload containing table and task
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, task })
            });

            // Parse JSON response
            const data = await response.json();

            // Clear the task input field in the DOM
            document.getElementById('taskInput').value = '';

            // Insert the new task into the DOM immediately
            // Assuming the tasks are displayed in an element with id matching the table name
            // Use data.inserted.id as the primary key / unique identifier
            const container = document.getElementById(table);
            if (container) {
                // Create the HTML string for the new task similar to handleFetchWebsite
                // The 'id' is the primary key and is used for the checkbox onchange handler
                const newTaskHTML = `
                    <label>
                        <input
                            type="checkbox"
                            ${data.inserted.completed ? 'checked' : ''}
                            onchange="updateTask('${table}', ${data.inserted.id}, this.checked)"
                        >
                        ${data.inserted.task}
                    </label>
                `;
                // Append the new task HTML to the existing content
                container.innerHTML += newTaskHTML;
            }

        } catch (err) {
            // Log error and alert user of failure
            console.error('Error adding task:', err);
            alert('Failed to add task');
        }
    }

    // Initiate the POST request to add the task
    return postTask(url);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, id, completed }) // Changed from task to id
            });

            // Parse JSON response (response data is not used further)
            const data = await response.json();

        } catch (err) {
            // Log error and alert user of failure
            console.error('Error updating task:', err);
            alert('Failed to update task');
        }
    }

    // Initiate the POST request to update the task
    postUpdate(url);
}




function submitTask(table, id, completed) {
    // Backend URL for updating a task
    const url = 'https://postgres.calebzaleski.com/delete_completed_tasks';

    /**
     * Sends a POST request to update the task's completion status.
     *
     * @param {string} url - The endpoint to send the request to.
     * @returns {Promise<void>}
     */
    async function postDelete(url) {
        try {
            // Send POST request with JSON payload containing table, id, and completed status
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table, id, completed }) // Changed from task to id
            });

            // Parse JSON response (response data is not used further)
            const data = await response.json();

        } catch (err) {
            // Log error and alert user of failure
            console.error('Error updating task:', err);
            alert('Failed to update task');
        }
    }

    // Initiate the POST request to update the task
   return postDelete(url);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ table })
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
 * Fetches tasks from the 'website_list' table and renders them as checkboxes in the DOM.
 *
 * NOTE: Updated checkbox onchange handler to pass task.id instead of task.task.
 * The 'id' is the primary key / unique identifier for tasks/items.
 *
 * @returns {Promise<void>}
 *
 * Side Effects:
 * - Updates the innerHTML of the element with id 'website_list' to display tasks.
 * - Each task is rendered with a checkbox that can update its completion status.
 */
async function handleFetchWebsite() {
    // Fetch tasks from 'website_list' table
    const tasks = await fetch_all('website_list');

    // Render tasks as checkboxes inside the element with id 'website_list'
    document.getElementById('website_list').innerHTML = tasks.map(task =>
        `<label data-id="${task.id}">
      <input
          type="checkbox"
          ${task.completed ? 'checked' : ''}
          onchange="updateTask('website_list', ${task.id}, this.checked)">
      ${task.task}
  </label>`
    ).join('');
}

/**
 * Fetches items from the 'threedprinting_list' table and renders them as paragraphs in the DOM.
 *
 * NOTE: Added data-id attribute to each <p> containing item.id and changed to use item.task instead of item.name.
 * The 'id' is the primary key / unique identifier for items.
 *
 * @returns {Promise<void>}
 *
 * Side Effects:
 * - Updates the innerHTML of the element with id 'threedprinting_list' to display items.
 */
async function handleFetchThreeDPrinting() {
    // Fetch items from 'threedprinting_list' table
    const items = await fetch_all('threedprinting_list');

    // Render each item as a paragraph inside the element with id 'threedprinting_list'
    // Use item.id as the primary key / unique identifier
    document.getElementById('threedprinting_list').innerHTML = items.map(item =>
        `<p data-id="${item.id}">${item.task}</p>`  // Changed from item.name to item.task
    ).join('');
}
