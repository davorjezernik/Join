/**
 * Handles the sign-up flow: validates the password confirmation,
 * creates the user account, and if successful, sets up the new
 * user's initial data and shows the success UI before redirecting.
 *
 * @param {string} [path="users"] - The backend path to post the new user to.
 */
async function signUp(path = "users") {
    const { name, email, password, confirmedPassword, color } = getUserData();
    if (password !== confirmedPassword) {
        alert("Passwords do not match.");
        return;
    }
    const responseToJson = await postUser(path, createUserObject(name, email, password));
    if (!responseToJson) return;
    const userUID = responseToJson.name;
    const userData = await setSignedUpUser(userUID);
    if (!userData) return;
    await setUpNewUserData(userUID, name, email, color);
    showSignUpSuccessAndRedirect();
}


/**
 * Sets up a newly signed-up user's initial data: creates their own
 * contact entry and copies over any tasks created as a guest.
 *
 * @param {string} userUID - The id of the newly created user.
 * @param {string} name - The user's name.
 * @param {string} email - The user's email address.
 * @param {string} color - The background color for the user's contact bubble.
 */
async function setUpNewUserData(userUID, name, email, color) {
    await createOwnContact(name, email, '', color, userUID);
    await copyGuestTasksToNewUser(userUID);
}


/**
 * Shows the sign-up success message with its transform animation,
 * then redirects to the summary page after a short delay.
 */
function showSignUpSuccessAndRedirect() {
    document.getElementById('successfull-container').classList.remove('d-none');
    document.getElementById('succesfull-signup').classList.add('transform');
    setTimeout(() => {
        window.location.href = "index.html";
    }, 1500);
}


/**
 * This function create an object with my own user data
 * 
 * @param {string} name 
 * @param {string} email 
 * @param {number} number 
 * @param {string} color 
 * @param {string} uid 
 * @returns {object}
 */
async function createOwnContact(name, email, number, color, uid) {
    const you = " (you)";
    const contact = {
        name: name + (you),
        email: email,
        number: number,
        backgroundcolor: color
    };
    const contactsToSave = await getContactsToCopy(uid, contact);
    await updateUserContacts(uid, contactsToSave);
    return contact;
}


/**
 * Builds the set of contacts to save for a new user: up to 10 of the
 * guest user's existing contacts (excluding the guest's own entry),
 * plus the new user's own contact. Guest contact lookup failures are
 * logged but don't prevent the user's own contact from being included.
 *
 * @param {string} uid - The new user's id, used to generate their contact id.
 * @param {Object} ownContact - The new user's own contact object.
 * @returns {Promise<Object>} A map of contact id to contact object.
 */
async function getContactsToCopy(uid, ownContact) {
    const contactsToSave = await getGuestContactsToCopy();
    const ownContactId = `${Date.now()}-${uid.slice(0, 6)}`;
    contactsToSave[ownContactId] = ownContact;
    return contactsToSave;
}


/**
 * Retrieves up to 10 of the guest user's contacts (excluding the
 * guest's own contact entry) to copy over to a new user. Returns an
 * empty object if the guest user or their contacts can't be found,
 * or if the lookup fails.
 *
 * @returns {Promise<Object>} A map of contact id to contact object.
 */
async function getGuestContactsToCopy() {
    const contactsToSave = {};
    try {
        const usersData = await loadUserData("users");
        const guestUser = findGuestUser(usersData);
        const guestContactEntries = getGuestContactEntries(guestUser);
        guestContactEntries.forEach(([contactId, guestContact]) => {
            contactsToSave[contactId] = guestContact;
        });
    } catch (error) {
        console.error("Failed to copy guest contacts:", error);
    }
    return contactsToSave;
}


/**
 * Finds the guest user entry within the users data by email.
 *
 * @param {Object} usersData - The full users data object.
 * @returns {Object|undefined} The guest user's data object, or
 * `undefined` if not found.
 */
function findGuestUser(usersData) {
    const guestUserEntry = Object.entries(usersData || {})
        .find(([_, user]) => user?.email === "guest.user@email.com");
    return guestUserEntry ? guestUserEntry[1] : undefined;
}


/**
 * Extracts up to 10 of a guest user's contact entries, excluding the
 * guest's own contact entry (matched by email).
 *
 * @param {Object|undefined} guestUser - The guest user's data object.
 * @returns {Array} An array of `[contactId, contact]` entries, or an
 * empty array if the guest user has no valid contacts.
 */
function getGuestContactEntries(guestUser) {
    const guestContacts = guestUser?.contacts;
    if (!guestContacts || typeof guestContacts !== "object") {
        return [];
    }
    return Object.entries(guestContacts)
        .filter(([_, guestContact]) => guestContact?.email !== "guest.user@email.com")
        .slice(0, 10);
}


/**
 * Initializes the sign-up form once the DOM is ready: wires up
 * button-state updates and password icon toggling on input/change,
 * and sets the initial state.
 */
document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.main-container-signup');
    const button = document.querySelector('.sign-up-button');
    setupSignupFormListeners(form, button);
    initializePasswordIcons();
    updateSignupButtonState(button);
});

