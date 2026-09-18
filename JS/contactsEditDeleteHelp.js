/**
 * Applies success or error styling and message text to a form field,
 * based on whether its value is currently valid.
 *
 * @param {Element|null} field - The input field element, or `null` if not found.
 * @param {Element|null} message - The validation message element, or `null` if not present.
 * @param {boolean} isValid - Whether the field's value is valid.
 * @param {string} errorText - The error message to display when invalid.
 */
function applyValidationStyle(field, message, isValid, errorText) {
    if (field) {
        field.style.borderColor = isValid ? 'green' : 'red';
    }
    if (message) {
        message.textContent = isValid ? '' : errorText;
        message.style.color = isValid ? 'green' : 'red';
    }
}


/**
 * This function validates the name of a contact. It should contain only letters/spaces
 * and be at most 100 characters long
 *
 * @param {string} id - Id of the name input field
 * @param {string} messageId - Id of the element showing the validation message
 * @returns {boolean} true if the name is valid
 */
function validateName(id, messageId) {
    const nameField = document.getElementById(id);
    const nameMessage = document.getElementById(messageId);
    const name = nameField ? nameField.value.trim() : '';
    const isValidName = !!nameField && /^[\p{L} ]{1,100}$/u.test(name);
    applyValidationStyle(nameField, nameMessage, isValidName, 'Enter a valid name (letters/spaces only, max 100 characters).');
    return isValidName;
}


/**
 * Prevents invalid characters from being entered into name fields.
 * Allows letters and spaces; blocks digits and most symbols.
 *
 * @param {KeyboardEvent} event - The keydown event on the name input
 */
function validateNameInput(event) {
    try {
        const key = event.key;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (key.length !== 1) return;
        if (!/^[a-zA-Z ]$/.test(key)) {
            event.preventDefault();
        }
    } catch (error) {
    }
}


/**
 * This function capitalizes the first letter of every word in a name
 *
 * @param {string} name - The name to format
 * @returns {string} the formatted name
 */
function formatName(name) {
    return name
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}


/**
 * This function validates the email of a contact. It should be in the format "example@mail.com"
 *
 * @param {string} id - Id of the email input field
 * @param {string} messageId - Id of the element showing the validation message
 * @returns {boolean} true if the email is valid
 */
function validateEmail(id, messageId) {
    const emailField = document.getElementById(id);
    const emailMessage = document.getElementById(messageId);
    const email = emailField ? emailField.value.trim() : '';
    const isValidEmail = !!emailField && /^(?!.*\.\.)([^\s@.]+(\.[^\s@.]+)*)@[^\s@.]+(\.[^\s@.]{2,})+$/.test(email);
    applyValidationStyle(emailField, emailMessage, isValidEmail, 'Input email: example@mail.com');
    return isValidEmail;
}


/**
 * This function validates the number of a contact. It should contain only digits and can
 * start with a plus sign. The length should be between 7 and 15 digits.
 *
 * @param {string} id - Id of the number input field
 * @param {string} messageId - Id of the element showing the validation message
 * @returns {boolean} true if the number is valid
 */
function validateNumber(id, messageId) {
    const numberField = document.getElementById(id);
    const numberMessage = document.getElementById(messageId);
    const number = numberField ? numberField.value.trim() : '';
    const isValidNumber = !!numberField && /^\+?\d{7,15}$/.test(number);

    applyValidationStyle(numberField, numberMessage, isValidNumber, 'It should be 7-15 digits. It can start with a plus sign.');
    return isValidNumber;
}


/**
 * This function shows the information that the user saved a new contact
 */
function openSuccessfullInfo() {
    let successBox = document.getElementById('successBox');
    let successMessage = document.getElementById('successMessage');
    successBox.classList.remove('d-none');
    setTimeout(() => {
        successMessage.style.transform = "translateY(0%)";
    }, 2000);
    setTimeout(() => {
        successBox.classList.add('d-none');
    }, 2000);
}


/**
 * This function shows the information that the user has deleted a contact
 */
function openSuccessfullDeleteInfo() {
    let successDeleteBox = document.getElementById('successDeleteBox');
    let successDeleteMessage = document.getElementById('successDeleteMessage');
    successDeleteBox.classList.remove('d-none');
    setTimeout(() => {
        successDeleteMessage.style.transform = "translateY(0%)";
    }, 2000);
    setTimeout(() => {
        successDeleteBox.classList.add('d-none');
    }, 2000);
}


/**
 * This function checks whether the contact exists and deletes it from the user data.
 * The contact disappears from the UI immediately (from the already-loaded data),
 * while the removal from the server and from tasks referencing it happens in the background.
 *
 * @param {string} email
 */
async function deleteContactDataAndUpdateUI(email) {
    const userData = await getCurrentUserData();
    const toBeDeletedContactId = findContactIdByEmailToDelete(userData.contacts, email);
    if (!toBeDeletedContactId) return;
    const deletedContactName = userData.contacts[toBeDeletedContactId].name;
    removeContactFromCacheAndRerender(toBeDeletedContactId);
    closeContactDeleteUI();
    await Promise.all([
        deleteContactFromTasks(userData.tasks, deletedContactName),
        deleteUserContact(uid, toBeDeletedContactId)
    ]);
}


/**
 * Closes the contact dialog/detail view and shows the delete
 * success message after a contact has been deleted.
 */
function closeContactDeleteUI() {
    closeDialog();
    openSuccessfullDeleteInfo();
    closeContactMobile();
    document.getElementById('contactInfos').innerHTML = '';
}


/**
 * This function removes a contact from the tasks that reference it. Only tasks
 * that actually contain the contact are written back, in parallel, and only the
 * task's contacts list is sent (not the whole task).
 *
 * @param {object} tasks
 * @param {string} deletedContactName
 */
async function deleteContactFromTasks(tasks, deletedContactName) {
    tasks = tasks || {};
    if (!deletedContactName) return;
    const updates = Object.keys(tasks)
        .map(taskId => buildTaskContactUpdate(tasks[taskId], taskId, deletedContactName))
        .filter(update => update !== null);
    await Promise.all(updates);
}


/**
 * Removes a deleted contact from a single task's contacts list, if
 * present, and returns a promise persisting the updated list.
 *
 * @param {object} task - The task to check and update.
 * @param {string} taskId - The id of the task.
 * @param {string} deletedContactName - The name of the contact that was deleted.
 * @returns {Promise|null} A promise persisting the change, or `null`
 * if the task didn't reference the deleted contact.
 */
function buildTaskContactUpdate(task, taskId, deletedContactName) {
    if (!task.contacts) return null;
    const contactsInTask = Object.values(task.contacts);
    const stillHasContact = contactsInTask.some(contact => contact.name === deletedContactName);
    if (!stillHasContact) return null;
    const remainingContacts = contactsInTask.filter(contact => contact.name !== deletedContactName);
    task.contacts = remainingContacts;
    return updateTaskContacts(uid, taskId, remainingContacts);
}


/**
 * This function gets the information to delete contacts used by deleteContactMobileView()
 *
 * @param {object} contacts
 * @param {string} email
 * @returns {string}
 */
function findContactIdByEmailToDelete(contacts, email) {
    const keys = Object.keys(contacts);
    for (let i = 0; i < keys.length; i++) {
        let contactId = keys[i];
        let contact = contacts[contactId];
        if (contact.email === email) {
            return contactId;
        }
    }
}