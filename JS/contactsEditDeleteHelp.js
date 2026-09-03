/**
 * This function validates the name of a contact. It should contain only letters/spaces
 * and be at most 100 characters long
 *
 * @param {string} id - Id of the name input field
 * @param {string} messageId - Id of the element showing the validation message
 * @returns {boolean} true if the name is valid
 */
function validateName(id, messageId) {
    let nameField = document.getElementById(id);
    let nameMessage = document.getElementById(messageId);
    let name = nameField ? nameField.value.trim() : '';
    let isValidName = /^[\p{L} ]{1,100}$/u.test(name);
    if (!nameField || !isValidName) {
        if (nameField) nameField.style.borderColor = 'red';
        if (nameMessage) {
            nameMessage.textContent = 'Enter a valid name (letters/spaces only, max 100 characters).';
            nameMessage.style.color = 'red';
        }
        return false;
    } else {
        nameField.style.borderColor = 'green';
        if (nameMessage) {
            nameMessage.textContent = '';
            nameMessage.style.color = 'green';
        }
        return true;
    }
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
    let emailField = document.getElementById(id);
    let emailMessage = document.getElementById(messageId);
    let email = emailField ? emailField.value.trim() : '';
    if (!emailField || !/^(?!.*\.\.)([^\s@.]+(\.[^\s@.]+)*)@[^\s@.]+(\.[^\s@.]{2,})+$/.test(email)) {
        if (emailField) emailField.style.borderColor = 'red';
        if (emailMessage) {
            emailMessage.textContent = 'Input email: example@mail.com';
            emailMessage.style.color = 'red';
        }
        return false;
    } else {
        emailField.style.borderColor = 'green';
        if (emailMessage) {
            emailMessage.textContent = '';
            emailMessage.style.color = 'green';
        }
        return true;
    }
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
    let numberField = document.getElementById(id);
    let numberMessage = document.getElementById(messageId);
    let number = numberField ? numberField.value.trim() : '';
    if (!numberField || !/^\+?\d{7,15}$/.test(number)) {
        if (numberField) numberField.style.borderColor = 'red';
        if (numberMessage) {
            numberMessage.textContent = 'It should be 7-15 digits. It can start with a plus sign.';
            numberMessage.style.color = 'red';
        }
        return false;
    } else {
        numberField.style.borderColor = 'green';
        if (numberMessage) {
            numberMessage.textContent = '';
            numberMessage.style.color = 'green';
        }
        return true;
    }
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
    let userData = await getCurrentUserData();
    let ToBeDeletedContactId = findContactIdByEmailToDelete(userData.contacts, email);
    if (ToBeDeletedContactId) {
        let deletedContactName = userData.contacts[ToBeDeletedContactId].name;
        let tasks = userData.tasks;
        removeContactFromCacheAndRerender(ToBeDeletedContactId);
        closeDialog();
        openSuccessfullDeleteInfo();
        closeContactMobile();
        document.getElementById('contactInfos').innerHTML = '';
        await Promise.all([
            deleteContactFromTasks(tasks, deletedContactName),
            deleteUserContact(uid, ToBeDeletedContactId)
        ]);
    }
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
    let taskKeys = Object.keys(tasks);
    if (!deletedContactName) return;
    const updates = [];
    for (let j = 0; j < taskKeys.length; j++) {
        const taskId = taskKeys[j];
        let task = tasks[taskId];
        if (!task.contacts) {
            continue;
        }
        const contactsInTask = Object.values(task.contacts);
        const stillHasContact = contactsInTask.some(singleContactInTask => singleContactInTask.name === deletedContactName);
        if (!stillHasContact) {
            continue;
        }
        const remainingContacts = contactsInTask.filter(singleContactInTask => singleContactInTask.name !== deletedContactName);
        task.contacts = remainingContacts;
        updates.push(updateTaskContacts(uid, taskId, remainingContacts));
    }
    await Promise.all(updates);
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
