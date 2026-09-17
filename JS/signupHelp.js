/**
 * This function get all the entered user data
 *
 * @returns {object}
 */
function getUserData() {
    let name = document.getElementById('name').value;
    let email = document.getElementById('email').value;
    let password = document.getElementById('password').value;
    let confirmedPassword = document.getElementById('confirmedPassword').value;
    let color = getRandomColor();
    return {
        name: name,
        email: email,
        password: password,
        confirmedPassword: confirmedPassword,
        color: color
    };
}


/**
 * This function create an object with the user data
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {object}
 */
function createUserObject(name, email, password) {
    return {
        name: name,
        email: email,
        password: password,
        urgentTasks: [],
        mediumTasks: [],
        lowTasks: [],
        contacts: [],
        tasks: {}
    };
}


/**
 * Wires up the sign-up form's input and change listeners: updates
 * the submit button's disabled state on every input, and toggles the
 * password visibility icon when a password field changes.
 *
 * @param {Element} form - The sign-up form container element.
 * @param {Element} button - The sign-up submit button element.
 */
function setupSignupFormListeners(form, button) {
    form.addEventListener('input', (event) => {
        updateSignupButtonState(button);
        if (event.target.id === 'password' || event.target.id === 'confirmedPassword') {
            handleInputIcon(event.target);
        }
    });
    form.addEventListener('change', () => updateSignupButtonState(button));
}


/**
 * Sets the initial password visibility icon state for both the
 * password and confirm-password fields.
 */
function initializePasswordIcons() {
    handleInputIcon(document.getElementById('password'));
    handleInputIcon(document.getElementById('confirmedPassword'));
}


/**
 * Enables or disables the sign-up button based on whether all
 * required fields are filled, the passwords match, and the policy
 * checkbox is accepted.
 *
 * @param {Element} button - The sign-up submit button element.
 */
function updateSignupButtonState(button) {
    const nameValue = document.getElementById('name').value.trim();
    const emailValue = document.getElementById('email').value.trim();
    const passwordValue = document.getElementById('password').value.trim();
    const confirmedPasswordValue = document.getElementById('confirmedPassword').value.trim();
    const allFilled = nameValue && emailValue && passwordValue && confirmedPasswordValue;
    const passwordsMatch = passwordValue === confirmedPasswordValue;
    const policyAccepted = document.getElementById('acceptPolicy').checked;
    button.disabled = !(allFilled && passwordsMatch && policyAccepted);
}


/**
 * This fuction displays or hide the entered password and places the curser where it was entered
 */
function togglePassword(inputId) {
    let passwordInput = document.getElementById(inputId);
    if (passwordInput.type === "text") {
        passwordInput.type = "password";
    } else {
        passwordInput.type = "text";
    }
    handleInputIcon(passwordInput);
    setTimeout(() => {
        const length = passwordInput.value.length;
        passwordInput.setSelectionRange(length, length);
    }, 0);
}


/**
 * This function checks whether the first and last name have been entered
 */
function validateName() {
    const nameInput = document.getElementById('name');
    let correctIncorrect = document.getElementById('nameCorrectIncorrectS');
    const nameValue = nameInput.value.trim();
    const nameRegex = /^[A-Za-z]+$/;
    if (nameRegex.test(nameValue)) {
        nameInput.style.borderColor = 'green';
        correctIncorrect.textContent = '';
        correctIncorrect.style.color = 'green';
    } else {
        nameInput.style.borderColor = 'red';
        correctIncorrect.textContent = 'Input Name (letters only)';
        correctIncorrect.style.color = 'red';
    }
}


/**
 * This function checks whethter the email was entered correctly
 */
function validateEmailS() {
    const emailInput = document.getElementById('email');
    const emailValue = emailInput.value.trim();
    const correctIncorrect = document.getElementById('emailCorrectIncorrectS');
    const emailRegex = /^(?!.*\.\.)([^\s@.]+(\.[^\s@.]+)*)@[^\s@.]+(\.[^\s@.]+)+$/;
    if (emailRegex.test(emailValue)) {
        emailInput.style.borderColor = 'green';
        correctIncorrect.textContent = '';
    } else {
        emailInput.style.borderColor = 'red';
        correctIncorrect.textContent = 'Invalid email format: example@mail.com';
        correctIncorrect.style.color = 'red';
    }
}


/**
 * Validates the password and confirm-password fields, applying
 * border and message styling to each, and updates the active
 * field's visibility icon.
 *
 * @param {Element} activeInput - The input field currently being typed in.
 */
function validatePassword(activeInput) {
    handleInputIcon(activeInput);
    const passwordValue = document.getElementById('password').value.trim();
    const confirmedPasswordValue = document.getElementById('confirmedPassword').value.trim();
    validatePasswordField(passwordValue);
    validateConfirmedPasswordField(confirmedPasswordValue, passwordValue);
}


/**
 * Validates the password field, requiring at least 3 characters, and
 * applies matching border and message styling.
 *
 * @param {string} passwordValue - The trimmed password field value.
 */
function validatePasswordField(passwordValue) {
    const passwordInput = document.getElementById('password');
    const correctIncorrectOne = document.getElementById('passwordOneCorrectIncorrect');
    if (passwordValue.length >= 3) {
        passwordInput.style.borderColor = 'green';
        correctIncorrectOne.textContent = '';
    } else {
        passwordInput.style.borderColor = 'red';
        correctIncorrectOne.textContent = 'Input a minimum of 3 signs';
        correctIncorrectOne.style.color = 'red';
    }
}


/**
 * Validates the confirm-password field against the password field,
 * requiring a match of at least 3 characters, and applies matching
 * border and message styling. Leaves the border neutral if the field
 * is still empty.
 *
 * @param {string} confirmedPasswordValue - The trimmed confirm-password field value.
 * @param {string} passwordValue - The trimmed password field value to match against.
 */
function validateConfirmedPasswordField(confirmedPasswordValue, passwordValue) {
    const confirmedPasswordInput = document.getElementById('confirmedPassword');
    const correctIncorrectTwo = document.getElementById('passwordTwoCorrectIncorrect');
    if (confirmedPasswordValue === passwordValue && confirmedPasswordValue.length >= 3) {
        confirmedPasswordInput.style.borderColor = 'green';
        correctIncorrectTwo.textContent = "";
    } else if (confirmedPasswordValue.length > 0) {
        confirmedPasswordInput.style.borderColor = 'red';
        correctIncorrectTwo.textContent = "Password doesn't match";
        correctIncorrectTwo.style.color = 'red';
    } else {
        confirmedPasswordInput.style.borderColor = '';
    }
}


/**
 * This function updates the password icon based on the current field state.
 */
function handleInputIcon(activeInput) {
    if (!activeInput) return;
    const inputWrapper = activeInput.closest('.input-with-icon');
    const icon = inputWrapper?.querySelector('img.signup-icon-setup');
    const value = activeInput.value.trim();
    activeInput.style.backgroundImage = 'none';
    if (icon) {
        if (value.length === 0) {
            icon.src = './img/lock.png';
            icon.style.display = 'block';
        } else if (activeInput.type === 'password') {
            icon.src = './img/visibility_off.png';
            icon.style.display = 'block';
        } else {
            icon.src = './img/visibility.png';
            icon.style.display = 'block';
        }
    }
}


/**
 * This function checks whether all fields are filled and the checkbox is checked, if not an error message is displayed
 */
function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    const errorMsg = document.getElementById('policyErrorMsg');
    errorMsg.textContent = '';
    const inputs = form.querySelectorAll('input[required]');
    const allFilled = [...inputs].every(input => input.value.trim() !== '');
    if (!allFilled) {
        errorMsg.textContent = 'Please fill out all fields.';
        return;
    }
    const checkbox = document.getElementById('acceptPolicy');
    if (!checkbox.checked) {
        errorMsg.textContent = 'Please accept the privacy policy.';
        return;
    }
    signUp('/users');
}
