const BASE_URL_USER_DATA = "https://join211-da-default-rtdb.europe-west1.firebasedatabase.app/";


/**
 * This function load user data from URL
 *
 * @param {string} path
 * @returns {object}
 */
async function loadUserData(path = "users") {
    let response = await fetch(BASE_URL_USER_DATA + path + ".json");
    return await response.json();
}


/**
 * This function saves the user data in external storage
 *
 * @param {string} path
 * @param {object} data
 * @returns {object}
 */
async function postUser(path, data) {
    let response = await fetch(`${BASE_URL_USER_DATA}/${path}.json`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    let responseToJson = await response.json();
    return responseToJson;
}


/**
 * This function updates the user datas at the external storage
 *
 * @param {string} uid
 * @param {object} userData
 */
async function updateUserData(uid, userData) {
    await fetch(`${BASE_URL_USER_DATA}/users/${uid}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });
}


/**
 * This function updates the user contacts at the external storage
 *
 * @param {string} uid
 * @param {object} contacts
 */
async function updateUserContacts(uid, contacts) {
    await fetch(`${BASE_URL_USER_DATA}/users/${uid}/contacts.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contacts)
    });
}


/**
 * This function updates a single contact of the user at the external storage,
 * so editing a contact doesn't have to upload the user's whole contacts list.
 *
 * @param {string} uid
 * @param {string} contactId
 * @param {object} contact
 */
async function updateSingleContact(uid, contactId, contact) {
    await fetch(`${BASE_URL_USER_DATA}/users/${uid}/contacts/${contactId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contact)
    });
}


/**
 * This function updates only the contacts list of a single task at the external
 * storage, so removing a contact from a task doesn't have to re-upload the
 * whole task (title, description, subtasks, attachments, ...).
 *
 * @param {string} uid
 * @param {string} taskId
 * @param {Array} contacts
 */
async function updateTaskContacts(uid, taskId, contacts) {
    await fetch(`${BASE_URL_USER_DATA}/users/${uid}/tasks/${taskId}/contacts.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(contacts)
    });
}


/**
 * This function updates the tasks of the user at the external storage
 *
 * @param {string} uid
 * @param {string} toBeEditedTaskId
 * @param {object} task
 */
async function updateUserTasks(uid, toBeEditedTaskId, task) {
    await fetch(`${BASE_URL_USER_DATA}/users/${uid}/tasks/${toBeEditedTaskId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(task)
    });
}


/**
 * This function deletes the user contacts at the external storage
 *
 * @param {string} uid
 * @param {object} contactId
 * @returns {object}
 */
async function deleteUserContact(uid, contactId) {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/contacts/${contactId}.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}


/**
 * This function deletes the user tasks at the external storage
 *
 * @param {string} uid
 * @param {object} taskId
 * @returns {object}
 */
async function deleteUserTask(uid, taskId) {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/tasks/${taskId}.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}


/**
 * This function edits the contacts of an user
 *
 * @param {string} path
 * @param {object} data
 * @returns {object}
 */
function postContacts(path = "", data = {}) {
    return fetch(BASE_URL_USER_DATA + path + ".json", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data)
    })
}


/**
 * This function edits the tasks of an user
 *
 * @param {string} path
 * @param {object} data
 * @returns {object}
 */
function postTask(path = "", data = {}) {
    return fetch(BASE_URL_USER_DATA + path + ".json", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(data)
    })
}