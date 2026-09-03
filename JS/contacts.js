let alphabet = [
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
]
let displayedLetters = [];
let cachedUserData = null;
let uid = localStorage.getItem('uid');


async function init() {
    includeHTML();
    await loadDataAfterChanges();
    showLoggedUserInitials();
    changeBgColorMenu();
}


async function loadDataAfterChanges() {
    let userData = await loadSpecificUserDataFromLocalStorage();
    cachedUserData = userData;
    checkExistingInitials(userData);
    displayInitialsFilter();
    displayInitialsAndContacts(userData);
}


/**
 * This function returns the most recently loaded user data, only fetching it
 * from the server if nothing has been loaded yet, so opening/editing contacts
 * that are already on screen doesn't re-download the user's whole data again.
 *
 * @returns {object}
 */
async function getCurrentUserData() {
    if (!cachedUserData) {
        cachedUserData = await loadSpecificUserDataFromLocalStorage();
    }
    return cachedUserData;
}


/**
 * This function removes a contact from the cached user data and immediately
 * re-renders the contact list from it, so a deletion shows up right away
 * instead of waiting for a server round-trip.
 *
 * @param {string} contactId
 */
function removeContactFromCacheAndRerender(contactId) {
    if (cachedUserData && cachedUserData.contacts) {
        delete cachedUserData.contacts[contactId];
    }
    checkExistingInitials(cachedUserData);
    displayInitialsFilter();
    displayInitialsAndContacts(cachedUserData);
}


/**
 * This function check the initials of the user and save them in the array
 *
 * @param {object} userData
 */
function checkExistingInitials(userData) {
    let contacts = userData.contacts;
    displayedLetters = [];
    if (contacts) {
        const keys = Object.keys(contacts);
        for (let i = 0; i < alphabet.length; i++) {
            let letter = alphabet[i];
            for (let j = 0; j < keys.length; j++) {
                let contactId = keys[j];
                let firstLetter = contacts[contactId]["name"].charAt(0);
                if (letter === firstLetter && displayedLetters.indexOf(letter) === -1) {
                    displayedLetters.push(firstLetter);
                }
            }
        }
    }
}


/**
 * This function create the first letters matching to the initials of an user
 */
function displayInitialsFilter() {
    let filteredContactContainer = document.getElementById('filteredContactsContainer');
    filteredContactContainer.innerHTML = '';
    for (let j = 0; j < displayedLetters.length; j++) {
        let displayedLetter = displayedLetters[j];
        filteredContactContainer.innerHTML += displayInitialsFilterHtml(j, displayedLetter);
    }
}


/**
 * This function displays all existing contacts
 *
 * @param {object} userData
 */
function displayInitialsAndContacts(userData) {
    let contacts = userData.contacts;
    let ownDatas = userData;
    for (let j = 0; j < displayedLetters.length; j++) {
        let contactInitial = document.getElementById(`initialLetter${j}`);
        let contactsContainer = document.getElementById(`contactsContainer${j}`);
        contactsContainer.innerHTML = '';
        displayContactsByInitial(contacts, contactInitial, contactsContainer, ownDatas);
    }
}


/**
 * This function sorted the contacts by firstname
 * 
 * @param {object} contacts 
 * @param {string} contactInitial 
 * @param {HTMLElement} contactsContainer 
 */
function displayContactsByInitial(contacts, contactInitial, contactsContainer) {
    Object.keys(contacts).forEach((contactId, i) => {
        let { name, email, backgroundcolor: color } = contacts[contactId];
        const words = (name || '').split(/\s+/).filter(Boolean);
        const firstLetterOfName = name ? name.charAt(0) : '';
        const lastName = words.length > 1 ? words[words.length - 1] : '';
        const firstLetterOfLastName = lastName ? lastName.charAt(0) : '';
        if (contactInitial && contactInitial.innerHTML === firstLetterOfName) {
            contactsContainer.innerHTML += getContactsContainerHtml(i, firstLetterOfName, firstLetterOfLastName, name, email);
            showColorForContact(i, color);
        }
    });
}


/**
 * This function displays the color for the contact
 * 
 * @param {number} i 
 * @param {string} color 
 */
function showColorForContact(i, color) {
    let contactInitial = document.getElementById(`contactsInitials${i}`);
    contactInitial.style.backgroundColor = color;
}


/**
 * This function loads specific user datas, extracted and return the contact id
 * 
 * @param {string} contactId 
 * @returns {string}
 */
async function findIndexOf(contactId) {
    let userData = await loadSpecificUserDataFromLocalStorage();
    const keys = Object.keys(userData.contacts);
    return keys.indexOf(contactId);
}


/**
 * This function loads the contacts with all the informations and displays them
 * 
 * @param {number} i 
 */
async function openContact(i) {
    let userData = await getCurrentUserData();
    let contacts = userData.contacts;
    let contactId = Object.keys(contacts)[i];
    let { name, email, number, backgroundcolor: color } = contacts[contactId];
    const words = (name || '').split(/\s+/).filter(Boolean);
    const firstLetterOfName = words.length > 0 ? words[0].charAt(0) : '';
    const firstLetterOfSurname = words.length > 1 ? words[words.length - 1].charAt(0) : '';
    let contactInfos = document.getElementById('contactInfos');
    contactInfos.innerHTML = getContactInfosHtml(firstLetterOfName, firstLetterOfSurname, name, email, number, i, contactId);
    showColorForBigContact(i, color);
    openContactChangeBgColor(i);
}


/**
 * This function check if an contact exists to change the background
 * 
 * @param {string} i 
 */
function openContactChangeBgColor(i) {
    let contactData = document.getElementById(`contactData${i}`);
    if (contactData) {
        changeBgColor(contactData);
    }
}


/**
 * This function changes the background color of a selected contact
 * 
 * @param {string} contactData 
 */
function changeBgColor(contactData) {
    let allcontacts = document.querySelectorAll('.bg-contact-container');
    allcontacts.forEach(contact => {
        contact.classList.remove('bg-contact-container');
    });
    contactData.classList.add('bg-contact-container');
}


/**
 * This function displays the random color for the selected contact
 * 
 * @param {number} i 
 * @param {string} color 
 */
function showColorForBigContact(i, color) {
    let contactInitialBig = document.getElementById(`contactsInitialsBig${i}`);
    contactInitialBig.style.backgroundColor = color;
    let contactData = document.getElementById(`contactData${i}`);
    contactData.classList.add('selected-contact-data');
}


/**
 * This function removes the own-user suffix from a contact name when editing.
 *
 * @param {string} name
 * @returns {string}
 */
function stripYouFromName(name) {
    const youSuffix = ' (you)';
    if (typeof name !== 'string') return '';
    return name.endsWith(youSuffix) ? name.slice(0, -youSuffix.length) : name;
}


/**
 * This function generates a random color
 * 
 * @returns {string}
 */
function getRandomColor() {
    let ownBackgroundColor;
    let newColor = document.getElementById('newColor');
    let symbols = "789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
        color += symbols[Math.floor(Math.random() * symbols.length)];
    }
    if (newColor) {
        newColor.style.backgroundColor = color;
        return color;
    } else {
        ownBackgroundColor = color;
        return ownBackgroundColor;
    }
}


/**
 * This function opens a new window to add a new contact
 */
function openAddNewContact() {
    let dialogEditContact = document.getElementById('dialogNewEditContact');
    dialogEditContact.innerHTML = getAddNewContactHtml();
    document.getElementById('dialogNewEditContact').classList.remove('d-none');
    document.body.style.overflow = 'hidden';
    let addNewContact = document.getElementById('addNewContact');
    addNewContact.style.transform = "translateX(113%)";
    setTimeout(() => {
        addNewContact.style.transform = "translateX(0)";
    }, 50);
    getRandomColor();
}


/**
 * This function closes the window for add a new contact
 */
function closeDialog() {
    document.getElementById('dialogNewEditContact').classList.add('d-none');
    document.getElementById('editDeleteMenuBox').classList.add('d-none');
    document.body.style.overflow = 'auto';
}


/**
 * This funcion loads all the informations of an contact to edit it
 * 
 * @param {number} i 
 */
async function openEditContact(i) {
    let { contacts } = await getCurrentUserData();
    let contactId = Object.keys(contacts)[i];
    let { name, email, number, backgroundcolor } = contacts[contactId] || {};
    let displayName = stripYouFromName(name);
    let dialogEditContact = document.getElementById('dialogNewEditContact');
    let [firstLetterOfName, firstLetterOfLastName] = displayName ? [displayName.charAt(0), displayName.split(' ')[1] || ''] : ['', ''];
    dialogEditContact.innerHTML = getEditContactHtml(firstLetterOfName, firstLetterOfLastName, displayName, email, number, backgroundcolor, contactId);
    dialogEditContact.classList.remove('d-none');
    let contactInitialBig = document.getElementById(`edit-contactsInitialsBig${contactId}`);
    contactInitialBig.style.backgroundColor = backgroundcolor;
    contactInitialBig.innerHTML = `${firstLetterOfName}${firstLetterOfLastName.charAt(0)}`;
    setTimeout(() => {
        document.getElementById('editNewContact').style.transform = "translateX(0)";
    }, 50);
}


/**
 * This function opens a menu to edit contacts
 */
async function editOpenedContactInMobileView() {
    const dialogEditContact = document.getElementById('dialogNewEditContact');
    const email = document.getElementById('emailOfContact').innerHTML;
    let userData = await getCurrentUserData();
    let ToBeEditedContactId = findContactIdByEmailToEdit(userData.contacts, email);
    document.body.style.overflow = 'hidden';
    if (ToBeEditedContactId) {
        const displayedName = stripYouFromName(document.getElementById('nameOfContact').innerHTML);
        const contact = userData.contacts[ToBeEditedContactId] || {};
        dialogEditContact.innerHTML = getEditContactHtmlMobileView(
            displayedName,
            email,
            document.getElementById('numberOfContact').innerHTML,
            ToBeEditedContactId,
            contact.backgroundcolor || ''
        );
        dialogEditContact.classList.remove('d-none');
        const editContactBubble = document.getElementById(`edit-contactsInitialsBig${ToBeEditedContactId}`);
        if (editContactBubble) {
            editContactBubble.style.backgroundColor = contact.backgroundcolor || '';
        }
        let editContact = document.getElementById('dialogNewEditContact');
        setTimeout(() => {
            editContact.style.transform = "translateY(0%)";
        }, 50);
    }
}


/**
 * This function get the informations to edit contacts width the fuction editOpenedContactInMobileView()
 * 
 * @param {object} contacts 
 * @param {string} email 
 * @returns {object}
 */
function findContactIdByEmailToEdit(contacts, email) {
    const keys = Object.keys(contacts);
    for (let i = 0; i < keys.length; i++) {
        const contactId = keys[i];
        if (contacts[contactId].email === email) return contactId;
    }
}