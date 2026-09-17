async function initSummary() {
    includeHTML();
    await loadAllTasks();
    await greetUser();
    await loadToDoTasks();
    await loadDoneTasks();
    await loadUrgentTasksNumber();
    await displayUpcomingDeadline();
    await loadInProgressTasks();
    await loadFeedbackTasks();
    showLoggedUserInitials();
    changeBgColorMenu();
}


/**
 * This function load all tasks of an user from the local storage
 */
async function loadAllTasks() {
    let allTasksNumber = document.getElementById('allTasksNumber');
    let tasks = await loadAllTasksFromStorage();
    if (tasks) {
        let taskIds = Object.keys(tasks);
        allTasksNumber.innerHTML = taskIds.length;
    } else {
        allTasksNumber.innerHTML = '0';
    }
}


/**
 * This function load the number of taks in the category done of an user and displays them
 */
async function loadDoneTasks() {
    let doneTasksNumber = document.getElementById('doneNumber');
    let tasks = await loadAllTasksFromStorage();
    if (tasks) {
        let taskIds = Object.keys(tasks);
        let doneTasksCount = 0;
        for (let i = 0; i < taskIds.length; i++) {
            let id = taskIds[i];
            if (tasks[id].dragCategory === 'done') {
                doneTasksCount++;
            }
        }
        doneTasksNumber.innerHTML = doneTasksCount;
    } else {
        doneTasksNumber.innerHTML = '0';
    }
}


/**
 * This function load the number of taks in the category urgent of an user and displays them
 */
async function loadUrgentTasksNumber() {
    let urgentTasksNumber = document.getElementById('urgentTasksNumber');
    let tasks = await loadAllTasksFromStorage();
    if (tasks) {
        let taskIds = Object.keys(tasks);
        let urgentTaskCount = 0;
        for (let i = 0; i < taskIds.length; i++) {
            let id = taskIds[i];
            if (tasks[id].priority === 'Urgent') {
                urgentTaskCount++;
            }
        }
        urgentTasksNumber.innerHTML = urgentTaskCount;
    } else {
        urgentTasksNumber.innerHTML = '0';
    }
}


/**
 * This function load the number of tasks in the category to do of an user and displays them
 */
async function loadToDoTasks() {
    let toDoTasksNumber = document.getElementById('toDosNumber');
    let tasks = await loadAllTasksFromStorage();
    if (tasks) {
        let taskIds = Object.keys(tasks);
        let toDoTasksCount = 0;
        for (let i = 0; i < taskIds.length; i++) {
            let id = taskIds[i];
            if (tasks[id].dragCategory === 'todo') {
                toDoTasksCount++;
            }
        }
        toDoTasksNumber.innerHTML = toDoTasksCount;
    } else {
        toDoTasksNumber.innerHTML = '0';
    }
}


/**
 * This function load the number of tasks in the category progress of an user and displays them
 */
async function loadInProgressTasks() {
    let inProgressTasksNumber = document.getElementById('inProgressNumber');
    let tasks = await loadAllTasksFromStorage();
    if (tasks) {
        let taskIds = Object.keys(tasks);
        let inProgressTasksCount = 0;
        for (let i = 0; i < taskIds.length; i++) {
            let id = taskIds[i];
            if (tasks[id].dragCategory === 'inprogress') {
                inProgressTasksCount++;
            }
        }
        inProgressTasksNumber.innerHTML = inProgressTasksCount;
    } else {
        inProgressTasksNumber.innerHTML = '0';
    }
}


/**
 * This function load the number of tasks in the category feedback of an user and displays them
 */
async function loadFeedbackTasks() {
    let feedbackTasksNumber = document.getElementById('feedbackNumber');
    let tasks = await loadAllTasksFromStorage();
    if (tasks) {
        let taskIds = Object.keys(tasks);
        let feedbackTasksCount = 0;
        for (let i = 0; i < taskIds.length; i++) {
            let id = taskIds[i];
            if (tasks[id].dragCategory === 'awaitfeedback') {
                feedbackTasksCount++;
            }
        }
        feedbackTasksNumber.innerHTML = feedbackTasksCount;
    } else {
        feedbackTasksNumber.innerHTML = '0';
    }
}


/**
 * This function load the specific user name of the user and displays the greet
 */
async function greetUser() {
    let userData = await loadSpecificUserDataFromLocalStorage();
    let userNameContainer = document.getElementById('userNameContainer');
    if (userData.name !== 'Guest') {
        userNameContainer.innerHTML = userData.name;
    } else {
        userNameContainer.innerHTML = 'Guest';
    }
    document.getElementById('greeting').innerHTML = getDayTime();
}


/**
 * This function determines the current time and selects the right greeting gretting
 * 
 * @param {number} dayTime 
 * @returns 
 */
function greetDayTime(dayTime) {
    if (dayTime < 10) {
        return 'Good Morning,'
    } else if (dayTime >= 10 && dayTime < 16) {
        return 'Hello,'
    } else if (dayTime >= 16 && dayTime < 18) {
        return 'Good afternoon,'
    } else {
        return 'Good evening,'
    }
}


/**
 * This function get the current time for the matching greeting
 * 
 * @returns 
 */
function getDayTime() {
    let dayTime = new Date().getHours();
    let greeting = greetDayTime(dayTime);
    return greeting;
}


/**
 * Displays the earliest upcoming deadline among urgent tasks.
 * Loads all tasks, finds the urgent task with the closest deadline,
 * and renders its formatted date (or a fallback message if none exist).
 */
async function displayUpcomingDeadline() {
    const deadline = document.getElementById('deadline');
    const tasks = await loadAllTasksFromStorage();
    if (!tasks) return;

    const earliestTask = findEarliestUrgentTask(tasks);
    deadline.innerHTML = earliestTask
        ? formatDeadlineDate(earliestTask.date)
        : 'No upcoming Deadlines';
}


/**
 * Finds the urgent task with the earliest deadline among a set of tasks.
 *
 * @param {Object} tasks - A map of task id to task object.
 * @returns {Object|null} The urgent task with the earliest deadline,
 * or `null` if no urgent tasks exist.
 */
function findEarliestUrgentTask(tasks) {
    let earliestTask = null;

    for (const id of Object.keys(tasks)) {
        const currentTask = tasks[id];
        if (currentTask.priority !== 'Urgent') continue;

        const currentTaskDeadline = new Date(currentTask.date);
        if (!earliestTask || currentTaskDeadline < new Date(earliestTask.date)) {
            earliestTask = currentTask;
        }
    }

    return earliestTask;
}


/**
 * Formats a date string as a long-form US date (e.g. "January 5, 2027").
 *
 * @param {string} date - The date string to format.
 * @returns {string} The formatted date.
 */
function formatDeadlineDate(date) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
}


function changeBgColorMenu() {
    if (window.location.pathname.includes('summary.html')) {
        let el = document.getElementById('summary');
        if (el) el.style.backgroundColor = '#091931';
    } else if (window.location.pathname.includes('addTask.html')) {
        let el = document.getElementById('addTask');
        if (el) el.style.backgroundColor = '#091931';
    } else if (window.location.pathname.includes('board')) {
        let el = document.getElementById('board');
        if (el) el.style.backgroundColor = '#091931';
    } else if (window.location.pathname.includes('contacts.html')) {
        let el = document.getElementById('contact');
        if (el) el.style.backgroundColor = '#091931';
    } else if (window.location.pathname.includes('legalNotice')) {
        let el = document.getElementById('legalNotice');
        if (el) el.style.backgroundColor = '#091931';
    } else if (window.location.pathname.includes('privacyPolicy')) {
        let el = document.getElementById('privacyPolicy');
        if (el) el.style.backgroundColor = '#091931';
    } else if (window.location.pathname.includes('legalNoticeExtern')) {
        let el = document.getElementById('legalNoticeExtern');
        if (el) el.style.backgroundColor = '#091931';
    } else if (window.location.pathname.includes('privacyPolicyExtern')) {
        let el = document.getElementById('privacyPolicyExtern');
        if (el) el.style.backgroundColor = '#091931';
    }
}