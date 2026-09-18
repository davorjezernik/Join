/**
 * This function updates the status of subtask
 *
 * @param {object} tasks
 * @param {number} i
 * @param {number} j
 * @param {*element} statusOfSubtask
 */
async function updateSubtaskStatus(tasks, i, j, statusOfSubtask) {
    let taskIds = Object.keys(tasks);
    let taskId = taskIds[i];
    let task = tasks[taskId];
    let subtasks = task.subtasks;
    let subtaskIds = Object.keys(subtasks);
    let subtaskId = subtaskIds[j];
    let subtask = subtasks[subtaskId];
    subtask.status = statusOfSubtask ? 'done' : 'undone';
    await updateSubtaskStatusInFirebase(subtask.status, taskId, subtaskId);
}


/**
 * This function updates the subtask status in external storage
 *
 * @param {element} status
 * @param {number} taskId
 * @param {number} subtaskId
 */
async function updateSubtaskStatusInFirebase(status, taskId, subtaskId) {
    let userData = await loadSpecificUserDataFromLocalStorage();
    let tasks = userData.tasks;
    if (tasks[taskId] && tasks[taskId].subtasks[subtaskId]) {
        tasks[taskId].subtasks[subtaskId].status = status;
        await updateUserData(uid, userData);
    }
}


/**
 * Determines the current search term from whichever search input
 * (large or small) is focused, falling back to whichever one has
 * a value if neither is focused.
 *
 * @returns {string} The lowercased search term, or an empty string
 * if no search input has a value.
 */
function getActiveSearchTerm() {
    const searchInput = document.getElementById('search');
    const searchInputSmall = document.getElementById('searchSmall');
    if (searchInput && searchInput === document.activeElement) {
        return searchInput.value.toLowerCase();
    } else if (searchInputSmall && searchInputSmall === document.activeElement) {
        return searchInputSmall.value.toLowerCase();
    } else if (searchInput && searchInput.value) {
        return searchInput.value.toLowerCase();
    } else if (searchInputSmall && searchInputSmall.value) {
        return searchInputSmall.value.toLowerCase();
    }
    return '';
}


/**
 * Logs a warning to the console if the "clickHere" element is
 * missing from the DOM.
 */
function warnIfClickHereMissing() {
    const clickHere = document.getElementById('clickHere');
    if (!clickHere) {
        console.warn('Element with id "clickHere" not found.');
    }
}


/**
 * Reveals the "clickHere" hint element (if present), applies the
 * search filter, and clears the drag-area highlight color.
 *
 * @param {string} search - The search term to filter tasks by.
 */
function showClickHereAndFilter(search) {
    const clickHere = document.getElementById('clickHere');
    if (clickHere) clickHere.classList.remove('display-none-a');
    filterWithSearchTerm(search);
    removeSpecificColorFromDragArea();
}


/**
 * Filters the rendered task cards by a search term, matching against
 * each task's title and description. Shows matching tasks and hides
 * the rest, then updates the visible task count display.
 *
 * @param {string} searchTerm - The lowercased search term to filter by.
 */
function filterWithSearchTerm(searchTerm) {
    let matchingTaskCount = 0;
    for (let i = 0; i < todos.length; i++) {
        if (filterSingleTask(i, searchTerm)) {
            matchingTaskCount++;
        }
    }
    updateTaskCountDisplay(matchingTaskCount);
}


/**
 * Filters a single task card by the given search term, toggling its
 * visibility based on whether the term matches its title or description.
 * Logs a warning if the task's title or card elements are missing.
 *
 * @param {number} i - The index of the task to filter.
 * @param {string} searchTerm - The lowercased search term to match against.
 * @returns {boolean} `true` if the task matched and was shown, `false` otherwise.
 */
function filterSingleTask(i, searchTerm) {
    const taskTitleElement = document.getElementById(`taskTitle${i}`);
    const taskDescriptionElement = document.getElementById(`description${i}`);
    const taskCard = document.getElementById(`task${i}`);
    if (!taskTitleElement) { console.warn(`taskTitle${i} not found.`); }
    if (!taskCard) { console.warn(`task${i} not found.`); }
    if (!taskTitleElement || !taskCard) { return false; }
    const taskTitle = taskTitleElement.innerHTML.toLowerCase();
    const taskDescription = taskDescriptionElement ? taskDescriptionElement.innerHTML.toLowerCase() : '';
    const isMatch = taskTitle.includes(searchTerm) || taskDescription.includes(searchTerm);
    taskCard.style.display = isMatch ? 'block' : 'none';
    return isMatch;
}


/**
 * Updates the "taskCount" display element with the number of
 * currently matching tasks. Logs a warning if the element is missing.
 *
 * @param {number} count - The number of matching tasks to display.
 */
function updateTaskCountDisplay(count) {
    const taskCountElem = document.getElementById('taskCount');
    if (taskCountElem) {
        taskCountElem.innerText = count;
    } else {
        console.warn('Element with id "taskCount" not found.');
    }
}


/**
 * Clears the value and error border styling of both search inputs
 * (large and small), if present.
 */
function resetSearchInputs() {
    const searchInput = document.getElementById('search');
    const searchInputSmall = document.getElementById('searchSmall');
    if (searchInput) {
        searchInput.value = '';
        searchInput.parentElement.style.borderColor = '';
    }
    if (searchInputSmall) {
        searchInputSmall.value = '';
        searchInputSmall.parentElement.style.borderColor = '';
    }
}


/**
 * Clears the text content and hides all search-related error
 * message elements.
 */
function hideSearchErrorMessages() {
    const errorMessages = document.querySelectorAll('[id^="correctSearch"]');
    errorMessages.forEach(errorMessage => {
        errorMessage.textContent = '';
        errorMessage.style.display = 'none';
    });
}


/**
 * Makes every rendered task card visible again, undoing any
 * search-based filtering.
 */
function showAllTaskCards() {
    for (let i = 0; i < todos.length; i++) {
        const taskCard = document.getElementById(`task${i}`);
        if (taskCard) {
            taskCard.style.display = 'block';
        }
    }
}


/**
 * This function allows tasks to be remove from a container
 *
 * @param {number} index
 */
function removeTaskFromContainer(index) {
    const taskElement = document.getElementById(`task${index}`);
    if (taskElement) {
        taskElement.remove();
        const container = taskElement.parentElement;
        if (container && container.children.length === 0) {
            const noTaskMessage = container.querySelector('.drag-area-text');
            if (noTaskMessage) noTaskMessage.style.display = 'block';
        }
    }
}


/**
 * Resolves a category key to its corresponding drag-area container element.
 *
 * @param {string} category - The task's category key.
 * @returns {Element|null} The matching container element, or `null` if
 * the category is unrecognized or the element doesn't exist.
 */
function getCategoryContainer(category) {
    const containerIdMap = {
        'todo': 'toDoTasks',
        'inprogress': 'inProgressTasks',
        'awaitfeedback': 'feedbackTasks',
        'done': 'done'
    };
    return document.getElementById(containerIdMap[category]);
}


/**
 * Marks a drag-area container as having elements, removing the
 * "empty" state styling and hiding its "no tasks" placeholder text.
 *
 * @param {Element} container - The drag-area container element.
 */
function markContainerAsHasElements(container) {
    container.classList.remove('drag-area-no-elements');
    container.classList.add('drag-area-has-elements');
    const noTaskMessage = container.querySelector('.drag-area-text');
    if (noTaskMessage) noTaskMessage.style.display = 'none';
}


/**
 * Populates the visual details of a newly added task card: contact
 * initials, subtask count, priority icon, and progress bar.
 *
 * @param {number} index - The index of the task in the `todos` array.
 */
function initializeTaskCardDetails(index) {
    getContactInitials(todos[index].task.contacts, index);
    generateNumberOfSubtasks(index, todos[index]);
    generatePriorityImgUnopened(index, todos[index]);
    updateLoadBar(index);
}
