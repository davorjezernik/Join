/**
 * This function sets the chosen category as the selected category and clears any category error
 *
 * @param {string} categoryName - The name of the category chosen by the user
 */
function selectCategory(categoryName) {
    const category = document.getElementById('selectCategory');
    const categoryContainer = document.getElementById('selectCategoryContainer');
    const categoryChosen = document.getElementById('correctCategory');
    category.textContent = categoryName;
    categoryContainer.style.borderColor = '';
    categoryChosen.textContent = '';
}


/**
 * This function clears the error styling and message shown for the task title field
 */
function clearTitleError() {
    const taskTitle = document.getElementById('taskTitle');
    const titleChosen = document.getElementById('correctTitle');
    taskTitle.style.borderColor = '';
    titleChosen.textContent = '';
}


/**
 * This function clears the error styling and message shown for the date field
 */
function clearDateError() {
    const date = document.getElementById('date');
    const dateChosen = document.getElementById('correctDate');
    date.style.borderColor = '';
    dateChosen.textContent = '';
}


/**
 * This function checks whether the task title is at least 4 characters long and shows an error if not
 *
 * @returns {boolean} true if the title is valid
 */
function validateTitle() {
    const taskTitle = document.getElementById('taskTitle');
    const titleChosen = document.getElementById('correctTitle');
    if (taskTitle.value.trim().length < 4) {
        taskTitle.style.borderColor = 'red';
        titleChosen.textContent = 'Title must be at least 4 characters.';
        titleChosen.style.color = 'red';
        return false;
    }
    clearTitleError();
    return true;
}


/**
 * This function checks whether a date has been selected and shows an error if not
 *
 * @returns {boolean} true if the date is valid
 */
function validateDate() {
    const date = document.getElementById('date');
    const dateChosen = document.getElementById('correctDate');
    if (!date.value) {
        date.style.borderColor = 'red';
        dateChosen.textContent = 'Please select a valid date.';
        dateChosen.style.color = 'red';
        return false;
    }
    clearDateError();
    return true;
}


/**
 * This function clears the error styling and message shown for the category field
 */
function clearCategoryError() {
    const categoryContainer = document.getElementById('selectCategoryContainer');
    const categoryChosen = document.getElementById('correctCategory');
    categoryContainer.style.borderColor = '';
    categoryChosen.textContent = '';
}


/**
 * This function checks whether a task category has been selected and shows an error if not
 *
 * @returns {boolean} true if a category is selected
 */
function validateCategory() {
    const categoryContainer = document.getElementById('selectCategoryContainer');
    const category = document.getElementById('selectCategory');
    const categoryChosen = document.getElementById('correctCategory');
    if (category.textContent === 'Select task category') {
        categoryContainer.style.borderColor = 'red';
        categoryChosen.textContent = 'Please select a task category.';
        categoryChosen.style.color = 'red';
        return false;
    }
    clearCategoryError();
    return true;
}


/**
 * This function saves the priority of the task in local storage and reacts to priority button clicks
 */
function addPrioEventListeners() {
    localStorage.setItem('lastClickedButton', 'Medium');
    document.getElementById('urgentButton').addEventListener('click', () => {
        localStorage.setItem('lastClickedButton', 'Urgent');
    });
    document.getElementById('mediumButton').addEventListener('click', () => {
        localStorage.setItem('lastClickedButton', 'Medium');
    });
    document.getElementById('lowButton').addEventListener('click', () => {
        localStorage.setItem('lastClickedButton', 'Low');
    });
}


/**
 * This function saves the task category in local storage when a category is clicked
 */
function addCategoryEventListener() {
    document.querySelectorAll('#categoryMenu li').forEach(category => {
        category.addEventListener('click', () => {
            localStorage.setItem('selectedCategory', category.textContent.trim());
        });
    });
}


/**
 * This function displays the name of contacts to use for the tasks
 */
async function displayNamesOfContacts() {
    let containerContact = document.getElementById("contactList");
    containerContact.innerHTML = '';
    let userData = await loadSpecificUserDataFromLocalStorage();
    let contacts = userData.contacts;
    if (contacts) {
        const keys = Object.keys(contacts);
        for (let i = 0; i < keys.length; i++) {
            let contactId = keys[i];
            let name = contacts[contactId]["name"];
            let color = contacts[contactId]["backgroundcolor"];
            let initials = getInitials(name);
            containerContact.innerHTML += generateContactToChoseHtml(name, color, initials, i);
        }
    }
}


/**
 * This function generates the initials of the contacts
 *
 * @param {string} name
 * @returns {string}
 */
function getInitials(name) {
    if (typeof name !== "string" || !name) {
        return "";
    }
    let upperChars = "";
    let words = name.split(" ");
    for (let word of words) {
        if (word.length > 0 && upperChars.length < 2) {
            upperChars += word[0].toUpperCase();
        }
    }
    return upperChars;
}


/**
 * This function adds subtasks to the tasks
 * @param {Event} event - The click event to prevent default behavior
 * @param {number} [taskIndex] - Optional task index
 */
function addSubtask(event, taskIndex) {
    if (event) event.preventDefault();
    let container = document.getElementById('subtasksContainer');
    let subtask = document.getElementById('inputFieldSubtask').value;
    if (subtask.trim() !== '') {
        let subtaskIndex = subtasks.length;
        subtasks.push(subtask);
        localStorage.setItem('subtasks', JSON.stringify(subtasks));
        container.innerHTML += addSubtaskHtml(taskIndex, subtaskIndex, subtask);
        document.getElementById('inputFieldSubtask').value = '';
    }
}


/**
 * This function loads the subtasks from local storage
 */
function loadSubtasksFromLocalStorage() {
    let savedSubtasks = localStorage.getItem('subtasks');
    if (savedSubtasks) {
        subtasks = JSON.parse(savedSubtasks);
        subtaskCounter = subtasks.length ? subtasks[subtasks.length - 1].id : 0;
    }
}


/**
 * This function edits the subtasks
 *
 * @param {number} taskIndex
 * @param {number} subtaskIndex
 */
function editSubtask(taskIndex, subtaskIndex) {
    let subtaskDiv = document.getElementById(`subtask${taskIndex}-${subtaskIndex}`);
    let text = subtaskDiv.innerHTML;
    document.getElementById('inputFieldSubtask').value = text;
    subtasks.splice(subtaskIndex, 1);
    localStorage.setItem('subtasks', JSON.stringify(subtasks));
    document.getElementById('subtask-Txt-' + taskIndex + '-' + subtaskIndex).remove();
    onInputChange();
}


/**
 * This function empties the input field after saving the task
 *
 * @param {Event} event - The click event to prevent default behavior
 */
function clearSubtaskInput(event) {
    if (event) event.preventDefault();
    let inpultField = document.getElementById('inputFieldSubtask');
    inpultField.value = '';
    onInputChange();
}


/**
 * This function deletes the subtasks
 *
 * @param {number} taskIndex
 * @param {number} subtaskIndex
 */
function deleteSubtask(taskIndex, subtaskIndex) {
    subtasks.splice(subtaskIndex, 1);
    localStorage.setItem('subtasks', JSON.stringify(subtasks));
    let subtaskElement = document.getElementById(`subtask-Txt-${taskIndex}-${subtaskIndex}`);
    if (subtaskElement) {
        subtaskElement.remove();
    }
}


/**
 * This function checks whether something was entered into the input field to show or hide buttons
 */
function onInputChange() {
    let subtaskImg = document.getElementById('plusImg');
    let subtaskButtons = document.getElementById('closeOrAccept');
    let inputField = document.getElementById('inputFieldSubtask');
    if (inputField.value.length > 0) {
        subtaskImg.style.display = 'none';
        subtaskButtons.style.display = 'flex';
    } else {
        subtaskImg.style.display = 'flex';
        subtaskButtons.style.display = 'none';
    }
}


/**
 * This function saves the selected contacts in local storage and displays them in the task
 *
 * @param {object} event
 * @param {number} i
 */
function choseContactForAssignment(event, i) {
    const checkbox = event.target;
    const contactToChose = document.getElementById(`contactToChose${i}`);
    const contactName = checkbox.getAttribute('data-name');
    const contactElement = checkbox.closest('.contact-boarder');
    const color = contactElement.querySelector('.circle-initial').style.background;
    if (checkbox.checked) {
        if (!assignedContacts.some(contact => contact.name === contactName)) {
            assignedContacts.push({ name: contactName, backgroundcolor: color });
            contactToChose.style.backgroundColor = "#2A3647";
            contactToChose.style.color = "white";
        }
    } else {
        assignedContacts = assignedContacts.filter(contact => contact.name !== contactName);
        contactToChose.style.backgroundColor = "";
        contactToChose.style.color = "";
    }
    localStorage.setItem('contactsAssignedToTask', JSON.stringify(assignedContacts));
    displayContactsForAssignment();
}


/**
 * This function displays the contacts selected in the task
 */
function displayContactsForAssignment() {
    let containerBubbleInitials = document.getElementById('contactsDisplayBubble');
    containerBubbleInitials.innerHTML = '';
    let checkboxes = document.querySelectorAll('.assign-contact-checkbox');
    for (let i = 0; i < checkboxes.length; i++) {
        let checkbox = checkboxes[i];
        if (checkbox.checked) {
            let contactElement = checkbox.closest('.contact-boarder');
            let initialsElement = contactElement.querySelector('.circle-initial .initial-style');
            let circleElement = contactElement.querySelector('.circle-initial');
            let initials = initialsElement.innerText;
            let color = circleElement.style.backgroundColor;
            containerBubbleInitials.innerHTML += generateBubbleInitialsHtml(i, initials, color);
        }
    }
}
