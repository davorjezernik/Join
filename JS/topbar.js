/**
 * This function displays the initials of the logged in user
 */
function showLoggedUserInitials() {
    if (!window.location.pathname.includes('privacyPolicyExtern.html') && !window.location.pathname.includes('legalNoticeExtern.html')) {
        let data = localStorage.getItem('data');
        let dataAsText = JSON.parse(data);
        let name = dataAsText.name
        let spaceIndex = name.indexOf(' ');
        let firstLetterOfName = name.charAt(0);
        let firstLetterOfLastName = name.charAt(spaceIndex + 1);
        let roundContainer = document.getElementById('userInitialsRoundContainer');
        if (roundContainer) {
            if (name && name === 'Guest') {
                roundContainer.innerHTML = `${firstLetterOfName}`;
            } else {
                roundContainer.innerHTML = `${firstLetterOfName}${firstLetterOfLastName}`;
            }
        }
    }
}


/**
 * This function hide or display the menu
 */
function toggleMenu() {
    document.getElementById('menu').classList.toggle('d-none');
}

function closeMenuOnOutsideClick(event) {
    const menu = document.getElementById('menu');
    const menuToggle = document.getElementById('userInitialsRoundContainer');

    if (!menu || menu.classList.contains('d-none')) {
        return;
    }

    if (menu.contains(event.target) || (menuToggle && menuToggle.contains(event.target))) {
        return;
    }

    menu.classList.add('d-none');
}

/**
 * This function loads the initials after the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
    includeHTML();
    document.addEventListener('click', closeMenuOnOutsideClick);
});