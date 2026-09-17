/**
 * This function load userdata, check the datas and if the user exist
 * it save the datas in local storage and put the status to logged in
 *
 * @param {string} email
 * @param {string} password
 */
async function setLoggedInGuest(email, password) {
    let data = await loadUserData("users");
    let users = Object.entries(data);
    let foundUser = users.find(([uid, u]) => u.email === email && u.password === password);
    let userUID = foundUser[0];
    localStorage.setItem('loggedInGuest', JSON.stringify({ email: email, password: password }));
    await setLoggedInUser(userUID);
}


/**
 * This function load user date and save in the local storage
 *
 * @param {string} uid
 */
async function setLoggedInUser(uid) {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const userData = await response.json();
    localStorage.setItem('uid', uid);
    localStorage.setItem('data', JSON.stringify(userData));
    return userData;
}


/**
 * This function get the datas of the signed up user from external storage
 *
 * @param {string} uid
 * @returns
 */
async function setSignedUpUser(uid) {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const userData = await response.json();
    return userData;
}


/**
 * This function recall the id of a user from the loacal storage
 *
 * @returns {string}
 */
function getLoggedInUser() {
    return localStorage.getItem('uid');
}


/**
 * This function loads the specific user data of the logged in user from the local storage
 *
 * @returns {object}
 */
async function loadSpecificUserDataFromLocalStorage() {
    let uid = getLoggedInUser();
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const userData = await response.json();
    return userData;
}


/**
 * This function loads the tasks of an user width low category
 *
 * @returns {object}
 */
async function getLowTasks() {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/lowTasks.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const lowTasks = await response.json();
    return lowTasks;
}


/**
 * This function loads the tasks of an user width medium category
 *
 * @returns {object}
 */
async function getMediumTasks() {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/mediumTasks.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const mediumTasks = await response.json();
    return mediumTasks;
}


/**
 * This function loads the tasks of an user width urgent category
 *
 * @returns {object}
 */
async function getUrgentTasks() {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/urgentTasks.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const urgentTasks = await response.json();
    return urgentTasks;
}


/**
 * This function saves the task for a single user by writing it directly to its own path,
 * so it never has to download or re-upload that user's other tasks (and their attachments).
 *
 * @param {string} userId
 * @param {string} sharedTaskId
 * @param {object} taskToSave
 */
async function saveTaskForUser(userId, sharedTaskId, taskToSave) {
    await fetch(`${BASE_URL_USER_DATA}/users/${userId}/tasks/${sharedTaskId}.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(taskToSave)
    });
}


/**
 * Syncs a task to all registered users, so every user's account has
 * a copy of the same shared task. The current user's own copy is
 * saved and awaited directly; other users' copies are synced in the
 * background (or awaited too, if there is no current user).
 *
 * @param {Object} task - The task data to sync.
 * @param {string|null} [taskId=null] - An existing shared task id to
 * reuse, or `null` to generate a new one.
 * @returns {Promise<string>} The shared task id used for the sync.
 */
async function syncTaskToAllRegisteredUsers(task, taskId = null) {
    const sharedTaskId = taskId || generateSharedTaskId();
    const currentUid = localStorage.getItem('uid');
    const taskToSave = { ...task, id: sharedTaskId, createdBy: currentUid || 'guest-user' };
    const otherUsersSynced = syncTaskToOtherUsers(sharedTaskId, taskToSave, currentUid);
    if (currentUid) {
        await saveTaskForUser(currentUid, sharedTaskId, taskToSave);
    } else {
        await otherUsersSynced;
    }
    return sharedTaskId;
}


/**
 * Generates a unique shared task id.
 *
 * @returns {string} A new shared task id.
 */
function generateSharedTaskId() {
    return `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}


/**
 * Syncs a task to every registered user except the current one.
 * Fetches a shallow list of all user ids and saves the task for each
 * one other than `currentUid`. Errors are logged but not thrown,
 * since this sync can run in the background.
 *
 * @param {string} sharedTaskId - The shared task id to save under.
 * @param {Object} taskToSave - The task data to save.
 * @param {string|null} currentUid - The current user's id, to exclude
 * from the sync.
 * @returns {Promise<void>}
 */
function syncTaskToOtherUsers(sharedTaskId, taskToSave, currentUid) {
    return fetch(`${BASE_URL_USER_DATA}/users.json?shallow=true`)
        .then(response => response.json())
        .then(shallowUsers => {
            const otherUserIds = Object.keys(shallowUsers || {}).filter(id => id !== currentUid);
            return Promise.all(otherUserIds.map(userId => saveTaskForUser(userId, sharedTaskId, taskToSave)));
        })
        .catch(error => console.error('Background task sync failed:', error));
}


/**
 * This function deletes a shared task from every registered user's own copy,
 * so deleting a task removes it for everybody it was shared with, not just the current user.
 *
 * @param {string} taskId
 */
async function deleteTaskForAllUsers(taskId) {
    const shallowUsers = await fetch(`${BASE_URL_USER_DATA}/users.json?shallow=true`)
        .then(response => response.json())
        .catch(() => null);
    const userIds = Object.keys(shallowUsers || {});
    await Promise.all(userIds.map(userId => fetch(`${BASE_URL_USER_DATA}/users/${userId}/tasks/${taskId}.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    })));
}


/**
 * Copies the guest user's tasks into a newly signed-up user's task
 * list, merging them with any tasks the new user already has. Does
 * nothing if no guest user is found.
 *
 * @param {string} userUID - The id of the new user to copy tasks into.
 */
async function copyGuestTasksToNewUser(userUID) {
    const guestUser = await findGuestUserData();
    if (!guestUser) return;

    const guestTasks = getValidTasksObject(guestUser.tasks);
    const currentTasks = await loadUserData(`users/${userUID}/tasks`);
    const mergedTasks = { ...(currentTasks || {}), ...guestTasks };

    await saveUserTasks(userUID, mergedTasks);
}


/**
 * Finds the guest user's data by looking up their email among all users.
 *
 * @returns {Promise<Object|undefined>} The guest user's data object,
 * or `undefined` if not found.
 */
async function findGuestUserData() {
    const usersData = await loadUserData('users');
    const guestUserEntry = Object.entries(usersData || {})
        .find(([_, user]) => user?.email === 'guest.user@email.com');
    return guestUserEntry ? guestUserEntry[1] : undefined;
}


/**
 * Returns a value as a valid tasks object, falling back to an empty
 * object if it isn't a valid object.
 *
 * @param {*} tasks - The value to check.
 * @returns {Object} The original value if it's a valid object,
 * otherwise an empty object.
 */
function getValidTasksObject(tasks) {
    return tasks && typeof tasks === 'object' ? tasks : {};
}


/**
 * Persists a user's full tasks object to the backend, replacing
 * whatever tasks list currently exists there.
 *
 * @param {string} userUID - The id of the user whose tasks are being saved.
 * @param {Object} tasks - The complete tasks object to save.
 */
async function saveUserTasks(userUID, tasks) {
    await fetch(`${BASE_URL_USER_DATA}/users/${userUID}/tasks.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks)
    });
}


/**
 * This function deletes the removed user contact from tasks
 *
 * @param {string} uid
 * @param {number} taskKey
 * @param {number} k
 * @returns
 */
async function deleteUserContactInTask(uid, task, k) {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/tasks/${task}/contacts/${k}.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}


/**
 * This function deletes the removed contacts in tasks
 *
 * @param {string} uid
 * @param {object} task
 * @returns {object}
 */
async function deleteAllContactsInTask(uid, task) {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/tasks/${task}/contacts/.json`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return response.json();
}


/**
 * This function deletes the datas of the logged in user at the local storage and logged out the user
 */
function clearLoggedInUser() {
    localStorage.removeItem('uid');
}


/**
 * This function loads the tasks of an user from the local storage
 *
 * @returns {object}
 */
async function loadAllTasksFromStorage() {
    let userData = await loadSpecificUserDataFromLocalStorage();
    let tasks = userData.tasks;
    return tasks;
}


/**
 * Loads tasks for a user based on the specified drag category (e.g., 'todo', 'inprogress', 'awaitfeedback', 'done').
 *
 * @param {string} dragCategory - The category to filter tasks by.
 * @returns {Array} - An array of tasks within the specified drag category.
 */
async function getTasksByDragCategory(dragCategory) {
    const response = await fetch(`${BASE_URL_USER_DATA}/users/${uid}/tasks.json`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    });
    const tasks = await response.json();
    if (!tasks) return [];
    return Object.values(tasks).filter(task => task.dragCategory === dragCategory);
}