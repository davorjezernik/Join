/**
 * This function displays the initials of the contacts in the tasks
 *
 * @param {object} contacts
 * @param {number} i
 */
async function getContactInitials(contacts, i) {
    let contactInitialsContainer = document.getElementById(`initialsContainer${i}`);
    contactInitialsContainer.innerHTML = '';
    if (contacts && contacts.length > 0) {
        renderContactInitials(contacts, i, contactInitialsContainer);
    }
}


/**
 * This function renders the initials (and a "+n" overflow badge) of the
 * given contacts into the provided container.
 *
 * @param {object} contacts
 * @param {number} i
 * @param {HTMLElement} container
 */
function renderContactInitials(contacts, i, container) {
    const maxInitialsToShow = 3;
    const extraContactsCount = contacts.length - maxInitialsToShow;
    for (let j = 0; j < Math.min(contacts.length, maxInitialsToShow); j++) {
        container.innerHTML += generateInitialHtml(contacts[j], i, j);
    }
    if (extraContactsCount > 0) {
        container.innerHTML += generateExtraContactsHtml(i, extraContactsCount);
    }
}


/**
 * This function generates the HTML for a single contact's initials bubble.
 *
 * @param {object} contact
 * @param {number} i
 * @param {number} j
 * @returns {string}
 */
function generateInitialHtml(contact, i, j) {
    const initial = getInitials(contact.name);
    const color = contact.backgroundcolor;
    return `
        <div id="initials${i}-${j}" class="initials" style="background-color: ${color};">
            ${initial}
        </div>`;
}


/**
 * This function generates the HTML for the "+n" overflow badge.
 *
 * @param {number} i
 * @param {number} extraContactsCount
 * @returns {string}
 */
function generateExtraContactsHtml(i, extraContactsCount) {
    return `
        <div id="initials${i}-extra" class="number-initials" style="color: black;">
            +${extraContactsCount}
        </div>`;
}


/**
 * This function changes an image when priority is selected
 *
 * @param {number} i
 */
function generatePriorityImgOpened(i) {
    const priority = document.getElementById(`openedPriority${i}`);
    const img = document.getElementById(`priorityImg${i}`);
    if (!img) return;
    let imgSrc = "./img/addTaskImg/low.svg";
    if (priority) {
        switch (priority.innerHTML) {
            case 'Medium':
                imgSrc = "./img/addTaskImg/medium.svg";
                break;
            case 'Urgent':
                imgSrc = "./img/addTaskImg/high.svg";
                break;
        }
    }
    img.src = imgSrc;
}


/**
 * This function opens a window for adding a task in another interface
 */
function openAddTaskInBoard() {
    let addTask = document.getElementById('addTaskContainerInBoard');
    addTask.classList.remove('d-none'); addTask.classList.add('addTask-container-background');
    let addTaskWindow = document.getElementById('addTaskPopUp');
    addTaskWindow.classList.add('bring-out-addTask-window');
    if (window.gallery !== document.getElementById('gallery')) {
        window.gallery = document.getElementById('gallery');
    }
    if (window.dropZone !== document.getElementById('dropZone')) {
        window.dropZone = document.getElementById('dropZone');
    }
}


/**
 * This function closes the window for adding a task in another interface
 */
function closeAddTaskInBoard() {
    let addTask = document.getElementById('addTaskContainerInBoard');
    addTask.classList.add('d-none');
    let addTaskWindow = document.getElementById('addTaskPopUp');
    addTaskWindow.classList.remove('bring-out-addTask-window');
    localStorage.removeItem('dragCategory');
    clearTitleError();
    clearDateError();
    clearCategoryError();
}


/**
 * This function limits the words in the small view of the tasks
 *
 * @param {string} containerId
 * @param {number} wordLimit
 */
function limitText(containerId, wordLimit) {
    var container = document.getElementById(containerId);
    if (container) {
        var words = container.innerText.split(' ');
        if (words.length > wordLimit) {
            var truncatedText = words.slice(0, wordLimit).join(' ') + ' ..';
            container.innerText = truncatedText;
        }
    }
}


/**
 * This function updates of the drag catagory in the tasks
 *
 * @param {element} category
 */
async function updateElements(category) {
    for (let i = 0; i < todos.length; i++) {
        const element = todos[i];
        if (element.task.dragCategory === category) {
            await updateDragCategoryInFirebase(category, element.id);
        }
    }
}


/**
 * This function updates the catagories in local storage
 *
 * @param {*} newDragCategory
 * @param {*} taskId
 */
async function updateDragCategoryInFirebase(newDragCategory, taskId) {
    let userData = await loadSpecificUserDataFromLocalStorage();
    let tasks = userData.tasks;
    if (tasks[taskId]) {
        tasks[taskId].dragCategory = newDragCategory;
        await updateUserData(uid, userData);
    }
}


/**
 * This function gets the container id's to change the background after drag and drop
 */
function removeSpecificColorFromDragArea() {
    let containers = [
        document.getElementById('toDoTasks'),
        document.getElementById('inProgressTasks'),
        document.getElementById('feedbackTasks'),
        document.getElementById('done')
    ];
    updateContainerClasses(containers);
}


/**
 * This function changes the backrground after dragging and dropping the tasks
 *
 * @param {object} containers
 */
function updateContainerClasses(containers) {
    let classHasElements = 'drag-area-has-elements';
    let classNoElements = 'drag-area-no-elements';
    let noTaskTitle = 'no-task';
    for (let i = 0; i < containers.length; i++) {
        let container = containers[i];
        container.classList.remove(classHasElements);
        container.classList.remove(classNoElements);
        if (container && container.querySelector('div')) {
            container.classList.add(classHasElements);
            container.classList.remove(noTaskTitle);
        } else {
            container.classList.add(classNoElements);
            container.classList.add(noTaskTitle);
        }
    }
}


/**
 * This function displays all tasks on board
 */
function displayAllTasks() {
    let taskContainers = document.querySelectorAll('.drag-area');
    taskContainers.forEach(container => {
        container.innerHTML = '';
        todos.forEach((task, index) => {
            addTaskToContainer(index, task.status);
        });
    });
    removeSpecificColorFromDragArea();
}


/**
 * This function displays the contacts and initials that can be selected for the tasks
 */
async function displayNamesOfContactsEdit() {
    let containerContact = document.getElementById("contactListEdit");
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
            containerContact.innerHTML += generateContactToChoseInEditTaskHtml(name, color, initials, i);
        }
    }
}


/**
 * This function allows you to select or deselect contacts für the tasks
 *
 * @param {object} event
 * @param {number} i
 */
function choseContactForAssignmentEditTask(event, i) {
    const data = getContactAssignmentData(event, i);
    let assignedContacts = JSON.parse(localStorage.getItem('toBeEditedAssignedContacts')) || [];
    if (data.checkbox.checked) {
        assignedContacts = addContactToAssignment(assignedContacts, data);
    } else {
        assignedContacts = removeContactFromAssignment(assignedContacts, data);
    }
    localStorage.setItem('toBeEditedAssignedContacts', JSON.stringify(assignedContacts));
    renderAssignedContactsBubblesEdit(assignedContacts);
}


/**
 * This function reads the checkbox, contact name and color from the
 * event target for a contact assignment checkbox in the edit task view.
 *
 * @param {object} event
 * @param {number} i
 * @returns {object}
 */
function getContactAssignmentData(event, i) {
    const checkbox = event.target;
    const contactToChose = document.getElementById(`contactToChoseInEditTask${i}`);
    const contactName = checkbox.getAttribute('data-name-edittask');
    const contactElement = checkbox.closest('.contact-boarder-edittask');
    const color = contactElement.querySelector('.circle-initial-edittask').style.background;
    return { checkbox, contactToChose, contactName, color };
}


/**
 * This function adds a contact to the assigned contacts list and marks
 * its element as selected.
 *
 * @param {Array<object>} assignedContacts
 * @param {object} data
 * @returns {Array<object>}
 */
function addContactToAssignment(assignedContacts, data) {
    const { contactToChose, contactName, color } = data;
    if (!assignedContacts.some(contact => contact.name === contactName)) {
        assignedContacts.push({ name: contactName, backgroundcolor: color });
        contactToChose.style.backgroundColor = "#2A3647";
        contactToChose.style.color = "white";
    }
    return assignedContacts;
}


/**
 * This function removes a contact from the assigned contacts list and
 * clears its element's selected styling.
 *
 * @param {Array<object>} assignedContacts
 * @param {object} data
 * @returns {Array<object>}
 */
function removeContactFromAssignment(assignedContacts, data) {
    const { contactToChose, contactName } = data;
    assignedContacts = assignedContacts.filter(contact => contact.name !== contactName);
    contactToChose.style.backgroundColor = "";
    contactToChose.style.color = "";
    return assignedContacts;
}


/**
 * This function dsiplays the assigned contacts in editing view
 */
async function displayAssignedContactsInEdit() {
    let userData = await loadSpecificUserDataFromLocalStorage();
    let tasks = userData.tasks;
    let taskId = localStorage.getItem('toBeEditedTaskId');
    let toBeEditedTask = tasks[taskId];
    let contacts = toBeEditedTask.contacts;
    if (toBeEditedTask && contacts) {
        renderAssignedContactsBubblesEdit(contacts);
    }
}


/**
 * This function redraws the assigned-contacts bubbles in the editing
 * view so they always match the currently selected contacts.
 *
 * @param {Array<Object>} contacts
 */
function renderAssignedContactsBubblesEdit(contacts) {
    let containerBubbleInitials = document.getElementById('contactsDisplayBubbleInEdit');
    containerBubbleInitials.innerHTML = '';
    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        let backgroundColor = contact.backgroundcolor;
        let name = contact.name;
        let initials = getInitials(name)
        containerBubbleInitials.innerHTML += generateBubbleInitialsHtml(i, initials, backgroundColor);
    }
}
