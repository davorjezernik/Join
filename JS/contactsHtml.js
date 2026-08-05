
function getContactsContainerHtml(i, firstLetterOfName, firstLetterOfLastName, fullName, email) {
    return `
        <div id="contactData${i}" class="contact-data pointer" onclick="openContact(${i}), openContactMobile(${i})">
            <div id="contactsInitials${i}" class="shorts-name">${firstLetterOfName}${firstLetterOfLastName}</div>
            <div class="contact-info">
                <div id="contact-name${i}" class="contact-name">${fullName}</div>
                <div id="contact-email${i}" class="contact-email">${email}</div>
            </div>
        </div>
    `;
}


function displayInitialsFilterHtml(j, displayedLetter) {
    return `
        <div class="initial-box">
            <div id="initialLetter${j}" class="initial-letter">${displayedLetter}</div>
            <div class="separator seperator-line"></div>
        </div>
        <div id="contactsContainer${j}">
        </div>
    `
}


function getContactInfosHtml(firstLetterOfName, firstLetterOfSurname, name, email, number, i, contactId) {
    return `
        <div>
            <div class="edit-delete-contact">
                    <div id="contactsInitialsBig${i}" class="shorts-name-big">${firstLetterOfName}${firstLetterOfSurname}</div>
                <div class="full-name">
                    <div id="nameOfContact">${name}</div>
                    <div class="edit-delete-box">
                        <div class="edit-delete">
                            <img onclick="openEditContact(${i})" src="./img/edit.png" class="pointer">
                            <a onclick="openEditContact(${i})" class="font-color">
                                Edit
                            </a>
                        </div>
                            
                        <div class="edit-delete">
                            <img onclick="deleteContact('${contactId}')" src="./img/delete.png" class="pointer">
                            <a onclick="deleteContact('${contactId}')" class="font-color">
                                Delete
                            </a>
                        </div>

                    </div>
                </div>
            </div>
         <div class="contact-information">Contact Information</div>
            <div class="email-phone-box">
                <div class="email-phone-headline">Email</div>
                <div id="emailOfContact" class="email-phone join">${email}</div>
                <div class="email-phone-headline">Phone</div>
                <div id="numberOfContact" class="email-phone">${number}</div>
            </div>
        </div>
    `;
}


function getAddNewContactHtml() {
    return `
        <div onclick="doNotClose(event)" id="addNewContact" class="add-new-contact">
            <div class="add-contact-left">
                <div>
                    <img src="./img/Capa 3.png">
                    <div class="add-new-contact-headline">Add contact</div>
                    <div class="text-contact">Tasks are better with a team!</div>
                    <div class="blue-seperator-contact"></div>
                </div>
            </div>
            <div class="add-contact-right">
                <div class="close-add-contact">
                    <img src="./img/close.png" onclick="closeDialog()">
                </div>
                <div class="contact-box-right">
                    <img src="./img/Group 13.png" class="contact-img">
                    <div class="data-box">
                        <div class="add-contact-data">

                            <div class="input-with-icon">
                            <input id="name" placeholder="Name" type="text" class="name-input" onkeydown="validateNameInput(event)" onblur="validateName('name', 'nameCorrectIncorrect')">
                            <img class="signup-icon-setup" src="./img/person.png" alt="Person icon">
                            </div>
                                <div id="nameCorrectIncorrect" class="correct-incorrect-contact"></div>

                            <div class="input-with-icon">
                            <input id="email" placeholder="Email" type="email" class="email-input email-input-edit" onblur="validateEmail('email', 'emailCorrectIncorrect')">
                            <img class="signup-icon-setup" src="./img/mail.png" alt="Mail icon">
                            </div>
                                <div id="emailCorrectIncorrect" class="correct-incorrect-contact"></div>

                            <div class="input-with-icon">
                            <input id="number" placeholder="Phone" type="tel" pattern="[0-9]*" class="phone-input" onblur="validateNumber('number', 'numberCorrectIncorrect')">
                            <img class="signup-icon-setup" src="./img/call.png" alt="Phone icon">
                            </div>
                                <div id="numberCorrectIncorrect" class="correct-incorrect-contact"></div>

                            <div class="close-create-button">
                                <button type="button" class="color-white-button wht-btn-edit" onclick="closeDialog(event)">
                                    <div class="button-txt-img">
                                        Cancel
                                        <img src="./img/addTaskImg/close.svg" class="close-svg" alt="Close">
                                    </div>
                                </button>
                                <button class="color-blue-button" onclick="createNewContact()";>
                                    <div class="button-txt-img">
                                        Create Contact
                                        <img src="./img/addTaskImg/check.svg" class="check-svg" alt="Check">
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div id="newColor" class="shorts-name d-none"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
}


function getEditContactHtml(firstLetterOfName, firstLetterOfLastName, name, email, number, backgroundcolor, contactId) {
    return `
        <div onclick="doNotClose(event)" id="editNewContact" class="add-new-contact">
            <div class="add-contact-left">
                <div>
                    <img src="./img/Capa 3.png">
                    <div class="add-new-contact-headline">Edit contact</div>
                    <div class="blue-seperator-contact"></div>
                </div>
            </div>
            <div class="add-contact-right">
                <div class="close-add-contact">
                    <img src="./img/close.png" onclick="closeDialog()">
                </div>
                <div class="contact-box-right">
                    <div id="edit-contactsInitialsBig${contactId}" class="edit-img">${firstLetterOfName}${firstLetterOfLastName}</div>
                    <div class="data-box">
                        <div class="add-contact-data">

                            <div class="input-with-icon">
                            <input id="editName${contactId}" placeholder="Name" type="text"  class="name-input" value="${name}" onkeydown="validateNameInput(event)" onblur="validateName('editName${contactId}', 'nameCorrectIncorrect${contactId}')">
                            <img class="signup-icon-setup" src="./img/person.png" alt="Person icon">
                            </div> 
                                <div id="nameCorrectIncorrect${contactId}" class="correct-incorrect-contact"></div>

                            <div class="input-with-icon">
                            <input id="editEmail${contactId}" placeholder="Email" type="email" class="email-input email-input-edit" value="${email}" onblur="validateEmail('editEmail${contactId}', 'emailCorrectIncorrect${contactId}')">
                            <img class="signup-icon-setup" src="./img/mail.png" alt="Mail icon">
                            </div>
                                <div id="emailCorrectIncorrect${contactId}" class="correct-incorrect-contact"></div>

                            <div class="input-with-icon">
                            <input id="editNumber${contactId}" placeholder="Phone" type="tel" pattern="[0-9]*" class="phone-input" value="${number}" onblur="validateNumber('editNumber${contactId}', 'numberCorrectIncorrect${contactId}')">
                            <img class="signup-icon-setup" src="./img/call.png" alt="Phone icon">
                            </div>
                                <div id="numberCorrectIncorrect${contactId}" class="correct-incorrect-contact"></div>

                        </div>
                        <div class="close-create-button">
                            <button type="button" onclick="deleteContact('${contactId}')" class="color-white-button delete-btn">
                                <div class="button-txt-img">Delete</div>
                            </button>
                            <button class="color-blue-button" onclick="saveEditContact('${contactId}')";>
                                <div class="button-txt-img">Save<img src="./img/addTaskImg/check.svg" class="check-svg"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}


function getEditContactHtmlMobileView(name, email, number, contactId, backgroundcolor = '') {
    const words = (name || '').trim().split(/\s+/).filter(Boolean);
    const firstLetter = words[0]?.charAt(0)?.toUpperCase() || '';
    const secondLetter = words.length > 1 ? words[words.length - 1].charAt(0).toUpperCase() : '';
    const initials = `${firstLetter}${secondLetter}`;
    return `
        <div onclick="doNotClose(event)" id="editNewContact" class="add-new-contact">
            <div class="add-contact-left">
                <div>
                    <img src="./img/Capa 3.png">
                    <div class="add-new-contact-headline">Edit contact</div>
                    <div class="blue-seperator-contact"></div>
                </div>
            </div>
            <div class="add-contact-right">
                <div class="close-add-contact">
                    <img src="./img/close.png" onclick="closeDialog()">
                </div>
                <div class="contact-box-right">
                    <div id="edit-contactsInitialsBig${contactId}" class="edit-img" style="background-color: ${backgroundcolor};">${initials}</div>
                    <div class="data-box">
                        <div class="add-contact-data">

                            <div class="input-with-icon">
                                <input id="editName${contactId}" placeholder="Name" type="text"  class="name-input" value="${name}" onkeydown="validateNameInput(event)" onblur="validateName('editName${contactId}', 'nameCorrectIncorrect${contactId}')">
                                <img class="signup-icon-setup" src="./img/person.png" alt="Person icon">
                            </div>  
                                <div id="nameCorrectIncorrect${contactId}" class="correct-incorrect-contact"></div>

                            <div class="input-with-icon">
                                <input id="editEmail${contactId}" placeholder="Email" type="email" class="email-input email-input-edit" value="${email}" onblur="validateEmail('editEmail${contactId}', 'emailCorrectIncorrect${contactId}')">
                                <img class="signup-icon-setup" src="./img/mail.png" alt="Mail icon">
                            </div>  
                                <div id="emailCorrectIncorrect${contactId}" class="correct-incorrect-contact"></div>

                            <div class="input-with-icon">
                                <input id="editNumber${contactId}" placeholder="Phone" type="tel" pattern="[0-9]*" class="phone-input" value="${number}" onblur="validateNumber('editNumber${contactId}', 'numberCorrectIncorrect${contactId}')">
                                <img class="signup-icon-setup" src="./img/call.png" alt="Phone icon">
                            </div>
                                <div id="numberCorrectIncorrect${contactId}" class="correct-incorrect-contact"></div>

                        </div>
                        <div class="close-create-button">
                            <button onclick="deleteContact('${contactId}')" class="color-white-button delete-btn">
                                <div class="button-txt-img">Delete</div>
                            </button>
                            <button onclick="saveEditContact('${contactId}')" class="color-blue-button">
                                <div class="button-txt-img">Save<img src="./img/addTaskImg/check.svg" class="check-svg"></div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>`;
}


function getEditDeleteMenuBoxHtml(contactId) {
    return `
    <div class="edit-delete-mobile">
        <img src="./img/edit.png" onclick="editOpenedContactInMobileView()" class="pointer">
        <a onclick="editOpenedContactInMobileView()" class="font-color">
            Edit
        </a>
    </div>
    <div class="edit-delete-mobile">
        <img src="./img/delete.png" onclick="deleteContactMobileView(${contactId})" class="pointer">
        <a onclick="deleteContactMobileView(${contactId})" class="font-color">
            Delete
        </a>
    </div>
    `
}
