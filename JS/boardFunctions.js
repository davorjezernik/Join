/**
 * This function sets the background color for the selected category
 *
 * @param {number} i
 */
function setCategoryColor(i) {
    let categoryContainer = document.getElementById(`category${i}`);
    if (categoryContainer && categoryContainer.innerHTML === 'Technical Task') {
        categoryContainer.style.backgroundColor = 'rgb(31, 215, 193)';
    } else if (categoryContainer && categoryContainer.innerHTML === 'User Story') {
        categoryContainer.style.backgroundColor = 'rgb(0, 56, 255)';
    } else if (categoryContainer && categoryContainer.innerHTML === 'Design') {
        categoryContainer.style.backgroundColor = 'rgb(255,211,155)';
    }
}


/**
 * This function displays the background color for the selected category in the larger view
 * of the task
 *
 * @param {number} i
 */
function setCategoryColorOpened(i) {
    let categoryContainerOpened = document.getElementById(`categoryOpened${i}`);
    if (categoryContainerOpened && categoryContainerOpened.innerHTML === 'Technical Task') {
        categoryContainerOpened.style.backgroundColor = 'rgb(31, 215, 193)';
    } else if (categoryContainerOpened && categoryContainerOpened.innerHTML === 'User Story') {
        categoryContainerOpened.style.backgroundColor = 'rgb(0, 56, 255)';
    } else if (categoryContainerOpened && categoryContainerOpened.innerHTML === 'Design') {
        categoryContainerOpened.style.backgroundColor = 'rgb(255,211,155)';
    }
}


/**
 * This function toggle the status of the subtask
 *
 * @param {number} i
 * @param {number} j
 */
async function toggleSubtaskStatus(i, j) {
    let subtaskCheckbox = document.getElementById(`subtaskCheckbox(${i}, ${j})`);
    localStorage.setItem(`subtaskCheck(${i}, ${j})`, subtaskCheckbox.checked);
    let statusOfSubtask = JSON.parse(localStorage.getItem(`subtaskCheck(${i}, ${j})`));
    let userData = await loadSpecificUserDataFromLocalStorage();
    let tasks = userData.tasks;
    let taskIds = Object.keys(tasks);
    let id = taskIds[i];
    await updateSubtaskStatus(tasks, i, j, statusOfSubtask);
    await generateNumberOfSubtasks(i, { id, task: tasks[id] });
    updateLoadBar(i);
}


/**
 * This function updates the loadbar
 *
 * @param {number} i
 */
function updateLoadBar(i) {
    const loadBarContainer = document.getElementById(`loadBarContainer${i}`);
    const loadBar = document.getElementById(`loadBar${i}`);
    const subtaskNumber = document.getElementById(`subtasksNumber${i}`);
    if (!loadBarContainer || !loadBar || !subtaskNumber) return;
    const subtaskText = subtaskNumber.innerHTML;
    const match = subtaskText.match(/(\d+)\/(\d+) Subtasks/);
    if (match) {
        const completedSubtasks = parseInt(match[1], 10);
        const totalSubtasks = parseInt(match[2], 10);
        const percentage = (completedSubtasks / totalSubtasks) * 100;
        loadBar.style.width = `${percentage}%`;
    } else {
        loadBarContainer.style.display = 'none';
        loadBar.style.width = '0%';
    }
}


/**
 * Filters searched tasks based on the current value of whichever
 * search input is active or populated. Toggles the "clickHere" hint
 * element and applies/clears filtering depending on the search
 * term's length.
 */
function filterTask() {
    const search = getActiveSearchTerm();
    warnIfClickHereMissing();
    if (search.length >= 3) {
        showClickHereAndFilter(search);
    } else if (search.length === 0) {
        clearClickHere();
        removeSpecificColorFromDragArea();
    }
}


/**
 * This function validates the search input after it loses focus.
 */
function validateSearch(searchInput) {
    let search = searchInput ? searchInput.value.trim() : '';
    let errorMessages = document.querySelectorAll('[id^="correctSearch"]');
    errorMessages.forEach(errorMessage => {
        if (search.length > 0 && search.length < 3) {
            errorMessage.textContent = 'Required: 3 letters';
            errorMessage.style.color = 'red';
            errorMessage.style.display = 'flex';
        } else {
            errorMessage.textContent = '';
            errorMessage.style.display = 'none';
        }
    });
    if (searchInput) {
        searchInput.parentElement.style.borderColor = search.length > 0 && search.length < 3 ? 'red' : '';
    }
}


/**
 * Clears the search UI back to its default state.
 * Hides the "clickHere" hint, clears search inputs and their error
 * styling, hides error messages, shows all task cards again, and
 * resets the visible task count to zero.
 */
function clearClickHere() {
    document.getElementById('clickHere').classList.add('display-none-a');
    resetSearchInputs();
    hideSearchErrorMessages();
    showAllTaskCards();
    document.getElementById('taskCount').innerText = '0';
}


/**
 * This function manages the drag and drop state
 *
 * @param {number} id
 */
function startDragging(id) {
    currentDraggedElement = id;
}


/**
 * This function allows tasks to be postponed
 *
 * @param {element} category
 * @param {number} i
 * @param {event} event
 */

async function moveTo(category) {
    todos[currentDraggedElement]['task']['dragCategory'] = category;
    await updateDragCategoryInFirebase(category, todos[currentDraggedElement].id);
    removeTaskFromContainer(currentDraggedElement);
    addTaskToContainer(currentDraggedElement, category);
    await displayOpenTasks()
}


/**
 * This function allows tasks to be postponed and update the datas on external storage
 *
 * @param {element} event
 * @param {element} category
 * @param {number} i
 */
async function moveToFromMenu(event, category, i) {
    event.stopPropagation();
    todos[i]['task']['dragCategory'] = category;
    await updateDragCategoryInFirebase(category, todos[i].id);
    removeTaskFromContainer(i);
    addTaskToContainer(i, category);
    await displayOpenTasks();
}


/**
 * Adds a rendered task card to the appropriate drag-area container
 * based on its category, and initializes its visual details
 * (contacts, subtask count, priority icon, and progress bar).
 *
 * @param {number} index - The index of the task in the `todos` array.
 * @param {string} category - The task's category key (e.g. 'todo',
 * 'inprogress', 'awaitfeedback', 'done').
 */
function addTaskToContainer(index, category) {
    const container = getCategoryContainer(category);
    if (!container) return;
    markContainerAsHasElements(container);
    container.innerHTML += getToDoTaskHtml(todos[index], index);
    initializeTaskCardDetails(index);
}


/**
 * This function checks the drag and drop container and displays the tasks or information
 */
document.addEventListener('DOMContentLoaded', () => {
    const containers = document.querySelectorAll('.drag-area');
    containers.forEach(container => {
        const tasks = container.querySelectorAll('.todo-class');
        const noTaskMessage = container.querySelector('.drag-area-text');
        if (tasks.length === 0 && noTaskMessage) {
            noTaskMessage.style.display = 'block';
        } else if (noTaskMessage) {
            noTaskMessage.style.display = 'none';
        }
    });
});


/**
 * This function makes it possible to drag and drop tasks into a container
 *
 * @param {*} event
 */
function allowDrop(event) {
    event.preventDefault();
}


/**
 * This function shows or hides the menu
 *
 * @param {object} event
 * @param {number} i
 */
function toggleMoveToMenu(event, i) {
    event.stopPropagation();
    document.getElementById(`moveToMenu${i}`).classList.toggle('d-none');
}
