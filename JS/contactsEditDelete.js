/**
 * This function display the contacts in mobile view under a screenwidth of 900px
 *
 * @param {number} i
 */
function openContactMobile(i) {
    let screenWidth = window.innerWidth;
    if (screenWidth < 900) {
        let contactBigContainer = document.getElementById('contactBigContainer');
        let contactsContainer = document.getElementById('contactsContainer');
        let contactHeadline = document.getElementById('contactHeadline');
        let arrowContact = document.getElementById('arrowContact');
        let btnEditContacts = document.getElementById('btnEditContacts');
        contactBigContainer.style.display = 'block';
        contactsContainer.classList.add('d-none');
        contactHeadline.style.display = 'block';
        arrowContact.style.display = 'block';
        btnEditContacts.classList.remove('d-none');
    }
}


/**
 * This function hide the mobile fiew of the contacts
 */
function closeContactMobile() {
    let contactBigContainer = document.getElementById('contactBigContainer');
    let contactsContainer = document.getElementById('contactsContainer');
    let contactHeadline = document.getElementById('contactHeadline');
    let arrowContact = document.getElementById('arrowContact');
    let btnEditContacts = document.getElementById('btnEditContacts');
    contactBigContainer.style.display = 'none';
    contactsContainer.classList.remove('d-none');
    contactHeadline.style.display = 'none';
    arrowContact.style.display = 'none';
    if (btnEditContacts) {
        btnEditContacts.classList.add('d-none');
    }
    let editDeleteMenuBox = document.getElementById('editDeleteMenuBox');
    if (editDeleteMenuBox) {
        editDeleteMenuBox.classList.add('d-none');
    }
}


/**
 * This function open a menu to edit contacts in the mobile view
 */
function openEditSmallMenu() {
    let editDeleteMenuBox = document.getElementById('editDeleteMenuBox');
    editDeleteMenuBox.classList.remove('d-none');
    setTimeout(() => {
        document.addEventListener('mousedown', handleClickOutsideEditMenu);
    }, 0);
}


/**
 * Handles closing the edit menu when clicking outside of it
 */
function handleClickOutsideEditMenu(event) {
    const menu = document.getElementById('editDeleteMenuBox');
    if (menu && !menu.classList.contains('d-none') && !menu.contains(event.target)) {
        menu.classList.add('d-none');
        document.removeEventListener('mousedown', handleClickOutsideEditMenu);
    }
}


/**
 * Validates and saves edits to the contact identified by `contactId`.
 * If all fields are valid, builds the updated contact data, updates
 * the local user data and UI, reopens the contact detail view, and
 * persists the change.
 *
 * @param {string} contactId - The id of the contact being edited.
 */
async function saveEditContact(contactId) {
    if (!isEditContactFormValid(contactId)) return;
    const userData = await getCurrentUserData();
    const existingContact = userData.contacts[contactId] || {};
    const updatedContact = buildUpdatedContact(contactId, existingContact);
    userData.contacts[contactId] = updatedContact;
    closeEditContactDialog();
    refreshContactsDisplay(userData);
    await reopenEditedContact(userData, contactId);
    await updateSingleContact(uid, contactId, updatedContact);
}


/**
 * Validates the name, email, and number fields of the edit-contact form.
 *
 * @param {string} contactId - The id of the contact being edited, used
 * to locate its form fields.
 * @returns {boolean} `true` if all three fields are valid, `false` otherwise.
 */
function isEditContactFormValid(contactId) {
    const isNameValid = validateName(`editName${contactId}`, `nameMessage${contactId}`);
    const isEmailValid = validateEmail(`editEmail${contactId}`, `emailMessage${contactId}`);
    const isNumberValid = validateNumber(`editNumber${contactId}`, `numberMessage${contactId}`);
    return isNameValid && isEmailValid && isNumberValid;
}


/**
 * Builds the updated contact object from the edit form's current
 * values, preserving the "(you)" name suffix and background color
 * from the existing contact.
 *
 * @param {string} contactId - The id of the contact being edited.
 * @param {Object} existingContact - The contact's current data, used
 * to preserve its name suffix and background color.
 * @returns {Object} The updated contact object.
 */
function buildUpdatedContact(contactId, existingContact) {
    const editedName = document.getElementById(`editName${contactId}`).value;
    const editedEmail = document.getElementById(`editEmail${contactId}`).value;
    const editedPhone = document.getElementById(`editNumber${contactId}`).value;
    const originalName = existingContact.name || '';
    const ownsSuffix = originalName.endsWith(' (you)');
    return {
        name: ownsSuffix ? `${editedName} (you)` : editedName,
        email: editedEmail,
        number: editedPhone,
        backgroundcolor: existingContact.backgroundcolor
    };
}


/**
 * Hides and closes the edit-contact dialog.
 */
function closeEditContactDialog() {
    document.getElementById('dialogNewEditContact').classList.add('d-none');
    closeDialog();
}


/**
 * Refreshes all contact-related UI displays after a contact update.
 *
 * @param {Object} userData - The current user data, including the
 * updated contacts list.
 */
function refreshContactsDisplay(userData) {
    checkExistingInitials(userData);
    displayInitialsFilter();
    displayInitialsAndContacts(userData);
}


/**
 * Reopens the contact detail view for the edited contact, if its
 * position can be found in the contacts list.
 *
 * @param {Object} userData - The current user data, including the
 * updated contacts list.
 * @param {string} contactId - The id of the edited contact.
 */
async function reopenEditedContact(userData, contactId) {
    const editedContactIndex = Object.keys(userData.contacts).indexOf(contactId);
    if (editedContactIndex !== -1) {
        await openContact(editedContactIndex);
    }
}


/**
 * Validates and creates a new contact from the "add contact" form.
 * If all fields are valid, builds the contact object, closes the
 * dialog, shows a success message, saves the contact to the backend,
 * and refreshes the contacts UI.
 */
async function createNewContact() {
    if (!isNewContactFormValid()) return;
    const contact = buildNewContactFromForm();
    closeDialog();
    openSuccessfullInfo();
    document.getElementById('contactInfos').innerHTML = '';
    const newContactId = await saveNewContact(contact);
    await refreshContactsAfterCreate(newContactId, contact);
}


/**
 * Validates the name, email, and number fields of the
 * "add contact" form.
 *
 * @returns {boolean} `true` if all three fields are valid, `false` otherwise.
 */
function isNewContactFormValid() {
    const isNameValid = validateName('name', 'nameCorrectIncorrect');
    const isEmailValid = validateEmail('email', 'emailCorrectIncorrect');
    const isNumberValid = validateNumber('number', 'numberCorrectIncorrect');
    return isNameValid && isEmailValid && isNumberValid;
}


/**
 * Builds a new contact object from the current values of the
 * "add contact" form, assigning it a random background color.
 *
 * @returns {Object} The new contact object.
 */
function buildNewContactFromForm() {
    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const number = document.getElementById('number').value.trim();
    const color = getRandomColor();

    return { name, email, number, backgroundcolor: color };
}


/**
 * Saves a new contact to the backend under the current user.
 *
 * @param {Object} contact - The contact object to save.
 * @returns {Promise<string>} The id assigned to the new contact.
 */
async function saveNewContact(contact) {
    const uid = localStorage.getItem('uid');
    const response = await postContacts('/users/' + uid + '/contacts', contact);
    const { name: newContactId } = await response.json();
    return newContactId;
}


/**
 * Refreshes the contacts UI after a new contact has been created,
 * incorporating it into the local user data first.
 *
 * @param {string} newContactId - The id assigned to the new contact.
 * @param {Object} contact - The newly created contact object.
 */
async function refreshContactsAfterCreate(newContactId, contact) {
    const userData = await getCurrentUserData();
    userData.contacts[newContactId] = contact;

    checkExistingInitials(userData);
    displayInitialsFilter();
    displayInitialsAndContacts(userData);
}


/**
 * This function delete an existing contact
 *
 * @param {string} contactId
 */
async function deleteContact(contactId) {
    let userData = await getCurrentUserData();
    let deletedContactName = userData.contacts[contactId] && userData.contacts[contactId].name;
    let tasks = userData.tasks;
    removeContactFromCacheAndRerender(contactId);
    openSuccessfullDeleteInfo();
    closeDialog();
    document.getElementById('contactInfos').innerHTML = '';
    await Promise.all([
        deleteContactFromTasks(tasks, deletedContactName),
        deleteUserContact(uid, contactId)
    ]);
}


/**
 * This function delete contacts in  mobile view
 */
async function deleteContactMobileView() {
    let email = document.getElementById('emailOfContact').innerHTML;
    await deleteContactDataAndUpdateUI(email);
}


/**
 * This function get the data of a contact to edit them
 *
 * @param {number} i
 */
async function getEditContact(i) {
    let userData = await loadSpecificUserDataFromLocalStorage();
    let contacts = userData.contacts;
    const keys = Object.keys(contacts);
    let contactId = keys[i];
    let currentContact = contacts[contactId];
    let name = currentContact.name;
    let email = currentContact.email;
    let number = currentContact.number;
    let backgroundcolor = currentContact.backgroundcolor;
    onloadFunc(contactId, name, email, number, backgroundcolor, currentContact, uid, userData);
}


/**
 * This function get the entered datas to save and update them
 *
 * @param {string} contactId
 * @param {string} name
 * @param {string} email
 * @param {number} number
 * @param {string} backgroundcolor
 * @param {string} currentContact
 * @param {string} uid
 * @param {object} userData
 */
async function onloadFunc(contactId, name, email, number, backgroundcolor, currentContact, uid, userData) {
    let editname = document.getElementById(`editName${contactId}`).value;
    let editemail = document.getElementById(`editEmail${contactId}`).value;
    let editnumber = document.getElementById(`editNumber${contactId}`).value;
    currentContact.name = editname;
    currentContact.email = editemail;
    currentContact.number = editnumber;
    await updateUserData(uid, userData);
}


/**
 * This function show the menu to edit or delete a contact
 *
 * @param {number} i
 */
function showEditDeleteMenuBox(contactId) {
    let editDeleteMenuBox = document.getElementById('editDeleteMenuBox');
    editDeleteMenuBox.innerHTML = getEditDeleteMenuBoxHtml(contactId);
}
