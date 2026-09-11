/**
 * This function get the assigned contacts to save them
 *
 * @returns {object}
 */
function getTaskContacts() {
    let newContacts;
    const toBeEditedAssignedContacts = JSON.parse(localStorage.getItem('toBeEditedAssignedContacts')) || [];
    newContacts = toBeEditedAssignedContacts;
    return newContacts;
}


/**
 * Retrieves all images stored for the task being edited from local storage.
 * @returns {Array} The list of stored images, or an empty array if none exist.
 */
function getTaskAllImages() {
    const allImages = JSON.parse(localStorage.getItem('allImages')) || [];
    return allImages;
}


/**
 * This function gets the assigned priority for saving
 *
 * @returns {element}
 */
function getTaskPriority() {
    const priority = localStorage.getItem('lastClickedButton');
    const toBeEditedPriority = localStorage.getItem('toBeEditedPriority');
    let newPriority;
    if (toBeEditedPriority === priority) {
        newPriority = toBeEditedPriority;
    } else {
        newPriority = priority;
    }
    return newPriority;
}


/**
 * This function gets the assigned subtask for saving
 *
 * @param {number} i
 * @returns {string}
 */
function getTaskSubtasks(i) {
    const subtasksContainer = document.getElementById(`subtasksContainer${i}`);
    const subtaskDivs = subtasksContainer.getElementsByClassName('subtask-Txt');
    const subtasks = [];
    for (let j = 0; j < subtaskDivs.length; j++) {
        const subtaskText = subtaskDivs[j].querySelector(`#subtask${i}-${j}`).innerText;
        subtasks.push({ text: subtaskText, status: 'undone' });
    }
    return subtasks;
}


/**
 * Restores the checked/selected state of contact checkboxes in the
 * edit-task view, based on previously assigned contacts stored in
 * localStorage. Does nothing if no assignment data is stored.
 */
function showCheckedContacts() {
    const assignedContactsJson = localStorage.getItem('toBeEditedAssignedContacts');
    if (!assignedContactsJson) {
        return;
    }
    const assignedContactNames = JSON.parse(assignedContactsJson).map(contact => contact.name);
    const contactCheckboxMap = buildContactCheckboxMap();
    applyCheckedStateToCheckboxes(contactCheckboxMap, assignedContactNames);
}


/**
 * Builds a lookup mapping each contact's index (extracted from its
 * element id) to that contact's display name, based on the elements
 * currently rendered in the edit-task contact list.
 *
 * @returns {Object.<string, string>} A map of contact index to contact name.
 */
function buildContactCheckboxMap() {
    const contacts = document.querySelectorAll('[id^="contactInEditTask-"]');
    const contactCheckboxMap = {};
    contacts.forEach(contact => {
        const contactName = contact.innerHTML.trim();
        const contactIndex = contact.id.split('-')[1];
        contactCheckboxMap[contactIndex] = contactName;
    });
    return contactCheckboxMap;
}


/**
 * Applies the checked state and matching visual styling to every
 * contact checkbox in the edit-task view, based on whether that
 * contact's name appears in the list of previously assigned contacts.
 *
 * @param {Object.<string, string>} contactCheckboxMap - Map of checkbox
 * index to contact name, as produced by `buildContactCheckboxMap`.
 * @param {string[]} assignedContactNames - Names of contacts that were
 * previously assigned to the task.
 */
function applyCheckedStateToCheckboxes(contactCheckboxMap, assignedContactNames) {
    const checkboxes = document.querySelectorAll('[id^="checkboxInEditTask"]');

    checkboxes.forEach(checkbox => {
        const checkboxIndex = checkbox.id.replace('checkboxInEditTask', '');
        const contactName = contactCheckboxMap[checkboxIndex];
        const contactToChose = document.getElementById(`contactToChoseInEditTask${checkboxIndex}`);

        checkbox.checked = contactName ? assignedContactNames.includes(contactName) : false;
        contactToChose.style.backgroundColor = checkbox.checked ? '#2A3647' : '';
        contactToChose.style.color = checkbox.checked ? 'white' : '';
    });
}


/**
 * Validates the edited task's title and date fields.
 *
 * @param {string} nameEdit - The edited task title.
 * @param {string} dateEdit - The edited task date.
 * @param {number} i - The index of the task being edited, used to
 * display validation errors on the correct form.
 * @returns {boolean} `true` if both the title and date are valid,
 * `false` otherwise.
 */
function isEditFormValid(nameEdit, dateEdit, i) {
    const isTitleValid = validateEditTitle(nameEdit, i);
    const isDateValid = validateEditDate(dateEdit, i);
    return isTitleValid && isDateValid;
}


/**
 * Builds the updated task object from the edited form fields and
 * the other task data currently held in state/localStorage.
 *
 * @param {string} nameEdit - The edited task title.
 * @param {string} descriptionEdit - The edited task description.
 * @param {string} dateEdit - The edited task date.
 * @param {number} i - The index of the task being edited, used to
 * locate its subtask elements.
 * @returns {Object} The complete updated task object, ready to be saved.
 */
function buildUpdatedTask(nameEdit, descriptionEdit, dateEdit, i) {
    const toBeEditedDragCategory = JSON.parse(localStorage.getItem('toBeEditedDragCategory'));
    const toBeEditedCategory = JSON.parse(localStorage.getItem('toBeEditedCategory'));
    return {
        name: nameEdit,
        description: descriptionEdit,
        date: dateEdit,
        contacts: getTaskContacts(),
        category: toBeEditedCategory,
        dragCategory: toBeEditedDragCategory,
        subtasks: getTaskSubtasks(i),
        priority: getTaskPriority(),
        allImages: getTaskAllImages()
    };
}


/**
 * Removes temporary localStorage entries used during task editing,
 * now that the edit has been saved.
 */
function clearEditTaskStorage() {
    localStorage.removeItem('contacts');
    localStorage.removeItem('allImages');
    localStorage.removeItem('toBeEditedAllImages');
}


/**
 * This function validates the edited task title.
 *
 * @param {string} title - The edited task title.
 * @param {number} i - The index of the task being edited.
 * @returns {boolean} `true` if the title is valid, `false` otherwise.
 */
function validateEditTitle(title, i) {
    const input = document.getElementById(`taskTitleEdit${i}`);
    const errorSpan = document.getElementById(`correctTitleEdit${i}`);
    const isValid = title && title.trim().length >= 4;
    if (!isValid) {
        if (input) input.style.borderColor = 'red';
        if (errorSpan) {
            errorSpan.textContent = 'Title must be at least 4 characters.';
            errorSpan.style.color = 'red';
        }
        return false;
    }
    if (input?.style.borderColor === 'red') input.style.borderColor = '';
    if (errorSpan?.textContent) errorSpan.textContent = '';
    return true;
}


/**
 * This function validates the edited task date.
 *
 * @param {string} date - The edited task date.
 * @param {number} i - The index of the task being edited.
 * @returns {boolean} `true` if the date is valid, `false` otherwise.
 */
function validateEditDate(date, i) {
    const input = document.getElementById(`dateEdit${i}`);
    const errorSpan = document.getElementById(`correctDateEdit${i}`);
    const isValid = Boolean(date);
    if (!isValid) {
        if (input) input.style.borderColor = 'red';
        if (errorSpan) {
            errorSpan.textContent = 'Please select a valid date.';
            errorSpan.style.color = 'red';
        }
        return false;
    }
    if (input?.style.borderColor === 'red') input.style.borderColor = '';
    if (errorSpan?.textContent) errorSpan.textContent = '';
    return true;
}


/**
 * This function gets the details of the task (description, name and date) for saving
 *
 * @param {number} i - The index of the task being edited.
 * @returns {Object} An object containing the edited task details.
 */
function getTaskDetails(i) {
    const nameEdit = document.getElementById(`taskTitleEdit${i}`).value || '';
    const descriptionEdit = document.getElementById(`taskDescriptionEdit${i}`).value || '';
    const dateEdit = document.getElementById(`dateEdit${i}`).value || '';
    return { nameEdit, descriptionEdit, dateEdit };
}
