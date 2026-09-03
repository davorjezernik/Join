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
 * This function save the changes of the editet contact
 *
 * @param {string} contactId
 */
async function saveEditContact(contactId) {
    const isNameValid = validateName(`editName${contactId}`, `nameMessage${contactId}`);
    const isEmailValid = validateEmail(`editEmail${contactId}`, `emailMessage${contactId}`);
    const isNumberValid = validateNumber(`editNumber${contactId}`, `numberMessage${contactId}`);
    if (isNameValid && isEmailValid && isNumberValid) {
        let userData = await getCurrentUserData();
        let existingContact = userData.contacts[contactId] || {};
        const editedName = document.getElementById(`editName${contactId}`).value;
        const editedEmail = document.getElementById(`editEmail${contactId}`).value;
        const editedPhone = document.getElementById(`editNumber${contactId}`).value;
        const originalName = existingContact.name || '';
        const ownsSuffix = originalName.endsWith(' (you)');
        const updatedContact = {
            name: ownsSuffix ? `${editedName} (you)` : editedName,
            email: editedEmail,
            number: editedPhone,
            backgroundcolor: existingContact.backgroundcolor
        };
        userData.contacts[contactId] = updatedContact;
        document.getElementById('dialogNewEditContact').classList.add('d-none');
        closeDialog();
        checkExistingInitials(userData);
        displayInitialsFilter();
        displayInitialsAndContacts(userData);
        let editedContactIndex = Object.keys(userData.contacts).indexOf(contactId);
        if (editedContactIndex !== -1) {
            await openContact(editedContactIndex);
        }
        await updateSingleContact(uid, contactId, updatedContact);
    }
}


/**
 * This function create and save an new contact
 *
 * @param {number} i
 */
async function createNewContact() {
    let isNameValid = validateName('name', 'nameCorrectIncorrect');
    let isEmailValid = validateEmail('email', 'emailCorrectIncorrect');
    let isNumberValid = validateNumber('number', 'numberCorrectIncorrect');
    if (isNameValid && isEmailValid && isNumberValid) {
        let uid = localStorage.getItem('uid');
        let name = document.getElementById('name').value.trim();
        let email = document.getElementById('email').value.trim();
        let number = document.getElementById('number').value.trim();
        let color = getRandomColor();
        let contact = { name: name, email: email, number: number, backgroundcolor: color };
        closeDialog();
        openSuccessfullInfo();
        document.getElementById('contactInfos').innerHTML = '';
        let response = await postContacts('/users/' + uid + '/contacts', contact);
        let { name: newContactId } = await response.json();
        let userData = await getCurrentUserData();
        userData.contacts[newContactId] = contact;
        checkExistingInitials(userData);
        displayInitialsFilter();
        displayInitialsAndContacts(userData);
    }
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
