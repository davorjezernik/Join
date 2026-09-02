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
 * This function creates one shared task id and stores the same task for every registered user.
 * The current user's copy is saved first so the UI can update immediately; the rest of the
 * users are synced in the background so task creation isn't slowed down by their number.
 *
 * @param {object} task
 * @param {string} taskId
 * @returns {string}
 */
async function syncTaskToAllRegisteredUsers(task, taskId = null) {
    const sharedTaskId = taskId || `task-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const currentUid = localStorage.getItem('uid');
    const taskToSave = {
        ...task,
        id: sharedTaskId,
        createdBy: currentUid || 'guest-user'
    };

    const otherUsersSynced = fetch(`${BASE_URL_USER_DATA}/users.json?shallow=true`)
        .then(response => response.json())
        .then(shallowUsers => {
            const otherUserIds = Object.keys(shallowUsers || {}).filter(id => id !== currentUid);
            return Promise.all(otherUserIds.map(userId => saveTaskForUser(userId, sharedTaskId, taskToSave)));
        })
        .catch(error => console.error('Background task sync failed:', error));

    if (currentUid) {
        await saveTaskForUser(currentUid, sharedTaskId, taskToSave);
    } else {
        await otherUsersSynced;
    }
    return sharedTaskId;
}


/**
 * This function copies all guest tasks into a newly registered user account.
 *
 * @param {string} userUID
 */
async function copyGuestTasksToNewUser(userUID) {
    const usersData = await loadUserData('users');
    const guestUserEntry = Object.entries(usersData || {}).find(([_, user]) => user?.email === 'guest.user@email.com');
    if (!guestUserEntry) {
        return;
    }
    const [, guestUser] = guestUserEntry;
    const guestTasks = guestUser?.tasks && typeof guestUser.tasks === 'object' ? guestUser.tasks : {};
    const currentTasks = await loadUserData(`users/${userUID}/tasks`);
    const mergedTasks = {
        ...(currentTasks || {}),
        ...guestTasks
    };
    await fetch(`${BASE_URL_USER_DATA}/users/${userUID}/tasks.json`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(mergedTasks)
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