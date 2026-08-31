let subtaskCounter = 0;
let assignedContacts = [];
let subtasks = [];


let uid = localStorage.getItem('uid');


/**
 * This function initializes the page: includes shared HTML, loads user data,
 * displays contacts, shows the logged in user's initials and sets the menu background color
 */
async function onloadFunction() {
    includeHTML();
    await loadSpecificUserDataFromLocalStorage();
    await displayNamesOfContacts();
    showLoggedUserInitials();
    changeBgColorMenu();
}


/**
 * This function checks whether the entries have been entered correctly before adding a new task
 *
 * @returns {boolean} true if title, date and category are all valid
 */
function validateAndAddTask() {
    const isTitleValid = validateTitle();
    const isDateValid = validateDate();
    const isCategoryValid = validateCategory();
    if (isTitleValid && isDateValid && isCategoryValid) {
        addTask();
    }
}


/**
 * This function executes the addPrioEventListeners and addCategoryEventListener functions
 * only after the full html element has loaded
 */
document.addEventListener('DOMContentLoaded', (event) => {
    addPrioEventListeners();
    addCategoryEventListener();
});


/**
 * This function retrieves data from local storage and creates an object with data,
 * then submits the task
 */
async function addTask() {
    const taskTitle = document.getElementById('taskTitle');
    const taskDescription = document.getElementById('taskDescription');
    const assignedContactsContainer = document.getElementById('contactsDisplayBubble');
    const subtasksContainer = document.getElementById('subtasksContainer');
    const date = document.getElementById('date');
    const contacts = JSON.parse(localStorage.getItem('contactsAssignedToTask'));
    const subtasks = JSON.parse(localStorage.getItem('subtasks'));
    const lastClickedButton = localStorage.getItem('lastClickedButton');
    const selectedCategory = localStorage.getItem('selectedCategory');
    const dragCategory = localStorage.getItem('dragCategory');
    const allImages = JSON.parse(localStorage.getItem('allImages')) || [];
    const task = createTaskObject(taskTitle.value, taskDescription.value, date.value, lastClickedButton, selectedCategory, contacts, subtasks);
    await handleTaskSubmission(task, assignedContactsContainer, date, subtasksContainer, dragCategory);
}


async function addContactsToTask() {

}


/**
 * This function posts the task to the server, resets the form, updates the tasks and shows
 * a confirmation for creating the task
 *
 * @param {object} task
 * @param {object} assignedContactsContainer
 * @param {number} date
 * @param {string} subtasksContainer
 */
async function handleTaskSubmission(task, assignedContactsContainer, date, subtasksContainer) {
    await syncTaskToAllRegisteredUsers(task);
    localStorage.removeItem('allImages');
    resetForm(assignedContactsContainer, date, subtasksContainer);
    if (window.location.pathname.includes('board.html')) {
        displayOpenTasks();
        closeAddTaskInBoard();
    }
    showConfirmationTask();
}


/**
 * This function creates an object for the tasks with the required parameters
 *
 * @param {string} name
 * @param {string} description
 * @param {number} date
 * @param {string} priority
 * @param {string} category
 * @param {object} contacts
 * @param {string} subtasks
 * @returns
 */
function createTaskObject(name, description, date, priority, category, contacts, subtasks) {
    const subtasksArray = createSubtasksArray(subtasks);
    return {
        name,
        description,
        date,
        priority,
        category,
        contacts,
        subtasks: subtasksArray,
        dragCategory: localStorage.getItem('dragCategory') || "todo",
        allImages: JSON.parse(localStorage.getItem('allImages')) || []
    };
}


/**
 * This function creates an array for the subtasks
 *
 * @param {object} subtasks
 * @returns {object}
 */
function createSubtasksArray(subtasks) {
    if (!subtasks) return [];
    return subtasks.map(subtask => ({
        text: subtask,
        status: "undone"
    }));
}


/**
 * This function clears all inputs on AddTask
 */
function removeAllInput() {
    document.getElementById("taskTitle").value = "";
    document.getElementById("taskDescription").value = "";
    document.getElementById("selectContact").textContent = "Search Contact";
    document.getElementById("contactsDisplayBubble").innerHTML = "";
    document.getElementById("date").value = "";
    if (typeof allImages !== 'undefined') {
        allImages.length = 0;
    }
    localStorage.removeItem('allImages');
    document.getElementById('gallery').innerHTML = '';
    renderImages();
    const priorityButtons = document.querySelectorAll(".button-prio");
    priorityButtons.forEach(button => {
        button.classList.remove("mediumSelected", "lowSelected", "urgentSelected");
    });
    const mediumButton = document.getElementById("mediumButton");
    mediumButton.classList.add("mediumSelected");
    document.getElementById("selectCategory").textContent = "Select task category";
    document.getElementById("inputFieldSubtask").value = "";
    document.getElementById("subtasksContainer").innerHTML = "";
    subtasks = [];
    localStorage.removeItem('subtasks');
    const checkboxes = document.querySelectorAll('.assign-contact-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.checked = false;
    });
    const contacts = document.querySelectorAll("[id^='contactToChose']");
    contacts.forEach(contact => {
        contact.style.backgroundColor = "";
        contact.style.color = "";
    });
    clearTitleError();
    clearDateError();
    clearCategoryError();
}
