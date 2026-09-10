/**
 * This function post the task to the server, reset the form, updates the tasks and shows
 * a confirmation for creating the task
 * 
 * @param {object} task 
 * @param {object} assignedContactsContainer 
 * @param {number} date 
 * @param {string} subtasksContainer 
 */
async function handleTaskSubmission(task, assignedContactsContainer, date, subtasksContainer) {
    await syncTaskToAllRegisteredUsers(task);
    resetForm(assignedContactsContainer, date, subtasksContainer);
    if (window.location.pathname.includes('board.html')) {
        displayOpenTasks();
        closeAddTaskInBoard();
    }
    showConfirmationTask();
}


/**
 * Deletes all uploaded images.
 * Clears the in-memory `allImages` array, removes the stored
 * images from localStorage, and re-renders the (now empty) gallery.
 */
function deleteAllImages() {
    allImages = [];
    localStorage.removeItem('allImages');
    renderImages();
}


/**
 * This function changes the color of the priority buttons and save the selected priority
 */
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('lowButton').onclick = function () { changeColor(this); };
    document.getElementById('mediumButton').onclick = function () { changeColor(this); };
    document.getElementById('urgentButton').onclick = function () { changeColor(this); };
});


/**
 * Initializes all dropdown components on the page once the DOM is ready.
 * Finds every element with the `.drop-down` class and sets up its
 * open/close behavior.
 */
document.addEventListener('DOMContentLoaded', () => {
    const dropDowns = document.querySelectorAll('.drop-down');
    dropDowns.forEach(setupDropDown);
});


/**
 * Sets up a single dropdown's interactive behavior.
 * Wires up the toggle-on-click handler, attaches option listeners,
 * and registers the outside-click handler that closes the dropdown.
 *
 * @param {Element} dropDown - The root `.drop-down` container element.
 */
function setupDropDown(dropDown) {
    const select = dropDown.querySelector('.select');
    const caret = dropDown.querySelector('.caret');
    const menu = dropDown.querySelector('.menu');
    const options = dropDown.querySelectorAll('.menu li');
    const selected = dropDown.querySelector('.selected');
    addToggleListener(select, caret, menu);
    addOptionListeners(options, select, caret, menu, selected);
    addOutsideClickListener(dropDown, select, caret, menu);
}


/**
 * Adds a click listener that toggles the open/closed state of a dropdown.
 * Toggles the "clicked" and "open" styling classes on the select box,
 * caret icon, and menu, and stops the click from bubbling up.
 *
 * @param {Element} select - The clickable element that opens/closes the menu.
 * @param {Element} caret - The caret icon that rotates on open/close.
 * @param {Element} menu - The dropdown menu element.
 */
function addToggleListener(select, caret, menu) {
    select.addEventListener('click', (event) => {
        event.stopPropagation();
        select.classList.toggle('selectClicked');
        caret.classList.toggle('createRotate');
        menu.classList.toggle('menu-open');
    });
}


/**
 * Adds a document-level click listener that closes the dropdown
 * whenever a click occurs outside of it.
 *
 * @param {Element} dropDown - The root `.drop-down` container element.
 * @param {Element} select - The select box element to reset.
 * @param {Element} caret - The caret icon element to reset.
 * @param {Element} menu - The dropdown menu element to close.
 */
function addOutsideClickListener(dropDown, select, caret, menu) {
    document.addEventListener('click', (event) => {
        if (!dropDown.contains(event.target)) {
            select.classList.remove('selectClicked');
            caret.classList.remove('createRotate');
            menu.classList.remove('menu-open');
        }
    });
}


/**
 * This function close the drop down menu when the user click at the body
 * 
 * @param {element} options 
 * @param {element} select 
 * @param {element} caret 
 * @param {element} menu 
 * @param {element} selected 
 */
function addOptionListeners(options, select, caret, menu, selected) {
    options.forEach(option => {
        option.addEventListener('click', () => {
            selected.textContent = option.textContent;
            select.classList.remove('selectClicked');
            caret.classList.remove('createRotate');
            menu.classList.remove('menu-open');
        });
    });
}


/**
 * This function reset the form so the user can create a new task
 * 
 * @param {object} assignedContactsContainer 
 * @param {number} date 
 * @param {string} subtasksContainer 
 */
function resetForm(assignedContactsContainer, date, subtasksContainer) {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDescription').value = '';
    assignedContactsContainer.innerHTML = '';
    date.value = '';
    subtasksContainer.innerHTML = '';
    localStorage.removeItem('dragCategory');
    localStorage.removeItem('subtasks');
    localStorage.removeItem('lastClickedButton');
    deleteAllImages();
}


/**
 * This function shows the user a confirmation that the task has been created.
 * On board.html the task is added via a modal that has no confirmation element,
 * so the animation and redirect are skipped there.
 */
function showConfirmationTask() {
    let addedToBoard = document.getElementById('addedToBoard');
    if (!addedToBoard) return;
    addedToBoard.classList.remove('d-none');
    setTimeout(() => {
        addedToBoard.classList.add('d-none');
        window.location.href = 'board.html';
    }, 1500);
}


/**
 * This function changes the color of priority buttons
 * 
 * @param {object} clickedButton 
 */

function changeColor(clickedButton) {
    let mediumButton = document.getElementById('mediumButton');
    mediumButton.classList.remove('orange-background');
    const buttons = [
        { element: document.getElementById('lowButton'), class: 'lowSelected' },
        { element: document.getElementById('mediumButton'), class: 'mediumSelected' },
        { element: document.getElementById('urgentButton'), class: 'urgentSelected' }
    ];
    buttons.forEach(button => {
        button.element.classList.toggle(button.class, button.element === clickedButton);
        if (button.element !== clickedButton) {
            button.element.classList.remove(button.class);
        }
    });
}



/**
 * This function allows saving the input from the subtask using the enter key
 */
const subtaskInput = document.getElementById('inputFieldSubtask');
subtaskInput.addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        addSubtask(event);
    }
});


/**
 * This function generetas the current day
 * 
 * @returns {number} current day
 */
function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}
    document.addEventListener('DOMContentLoaded', () => {
        const dateInput = document.getElementById('date');
        dateInput.setAttribute('min', getTodayDate());
});