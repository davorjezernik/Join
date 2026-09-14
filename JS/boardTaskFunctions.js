let currentDraggedElement;
let currentTask = 0;
let editedSubtask = null;
let todos = [];


/**
 * This function initializes the board: includes shared HTML, loads and displays the tasks,
 * shows the logged in user's initials and sets the menu background color
 */
async function initBoard() {
    includeHTML();
    await displayOpenTasks();
    showLoggedUserInitials();
    changeBgColorMenu();
}


/**
 * This function displays the tasks
 */
async function displayOpenTasks() {
    const containers = {
        'todo': document.getElementById('toDoTasks'),
        'inprogress': document.getElementById('inProgressTasks'),
        'awaitfeedback': document.getElementById('feedbackTasks'),
        'done': document.getElementById('done')
    };
    for (let key in containers) {
        containers[key].innerHTML = '';
    }
    todos = [];
    await processTasks(containers);
    removeSpecificColorFromDragArea();
}


/**
 * This function gets all the data to load the tasks in the processTasks() function
 *
 * @param {element} container
 * @param {element} task
 * @param {number} i
 * @param {element} taskData
 */
async function handleTaskInContainer(container, task, i, taskData) {
    container.innerHTML += getToDoTaskHtml(task, i);
    setCategoryColor(i);
    await getContactInitials(taskData.contacts, i);
    todos[i] = task;
    await generateNumberOfSubtasks(i, task);
    await generatePriorityImgUnopened(i, task);
    updateLoadBar(i);
}


/**
 * This function loads all the data and information and displays it in the tasks
 *
 * @param {element} containers
 */
async function processTasks(containers) {
    const userData = await loadSpecificUserDataFromLocalStorage();
    const tasks = userData.tasks;
    if (tasks) {
        const taskIds = Object.keys(tasks);
        for (let i = 0; i < taskIds.length; i++) {
            const id = taskIds[i];
            const taskData = tasks[id];
            const task = { id: id, task: taskData };
            const category = taskData['dragCategory'];
            const container = containers[category];
            if (container) {
                await handleTaskInContainer(container, task, i, taskData);
            }
        }
    }
}


/**
 * This function opens a larger view of the task
 *
 * @param {number} i
 */
async function zoomTaskInfo(i) {
    try {
        const modal = document.getElementById(`myModal${i}`);
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        setCategoryColorOpened(i);
        window.onclick = function (event) {
            if (event.target == modal) {
                closeModal(modal);
            }
        };
        generatePriorityImgOpened(i);
    } catch (error) {
    }
}


/**
 * This function closes the larger viwe of the task
 *
 * @param {string} modal
 */
function closeModal(modal) {
    displayOpenTasks();
    modal.style.display = "none";
    document.body.style.overflow = "auto";
    window.onclick = null;
}


/**
 * Thias function deletes the tasks
 *
 * @param {number} i
 */
async function deleteTask(i) {
    const taskId = todos[i].id;
    await deleteTaskForAllUsers(taskId);
    const modal = document.getElementById(`myModal${i}`);
    if (modal) {
        closeModal(modal);
    } else {
        await displayOpenTasks();
    }
}


const emptyArray = [];


/**
 * This function saves the changes to an edited task and displays them
 *
 * @param {number} i
 */
/**
 * Opens the edit view for the task at index `i`.
 * Persists the task's current data to localStorage for the edit
 * session, renders the edit modal content, and initializes all
 * interactive elements within it (image upload/drag-drop, dropdowns,
 * priority buttons, and contact display).
 *
 * @param {number} i - The index of the task in the `todos` array being edited.
 */
async function editTask(i) {
    await loadSpecificUserDataFromLocalStorage();
    const task = todos[i]['task'];
    storeTaskEditState(i, task);
    const modalContentEdit = document.getElementById(`modal${i}`);
    modalContentEdit.innerHTML = generateEditModalContent(task, i);
    setupEditGallery(i);
    setupFileUploadListener(i);
    setupDropZoneListeners(i);
    initializeEditModalControls();
}

/**
 * Persists the task's contacts, drag category, category, priority,
 * images, and id to localStorage so the edit modal and its supporting
 * functions can read them during the edit session.
 *
 * @param {number} i - The index of the task in the `todos` array.
 * @param {Object} task - The task's `task` data object.
 */
function storeTaskEditState(i, task) {
    localStorage.setItem('toBeEditedAssignedContacts', JSON.stringify(task.contacts || emptyArray));
    localStorage.setItem('toBeEditedDragCategory', JSON.stringify(task.dragCategory));
    localStorage.setItem('toBeEditedCategory', JSON.stringify(task.category));
    localStorage.setItem('toBeEditedPriority', JSON.stringify(task.priority));
    if (task.allImages) {
        localStorage.setItem('allImages', JSON.stringify(task.allImages));
    } else {
        localStorage.removeItem('allImages');
    }
    localStorage.setItem('toBeEditedTaskId', todos[i].id);
}


/**
 * Sets up the image gallery for the edit modal, pointing the global
 * `gallery` reference at this task's gallery element and loading
 * its images.
 *
 * @param {number} i - The index of the task in the `todos` array.
 */
function setupEditGallery(i) {
    window.gallery = document.getElementById(`gallery${i}`);
    if (typeof gallery !== 'undefined') gallery = window.gallery;
    window.loadImages();
}


/**
 * Adds a change listener to the edit modal's file upload input, so
 * that selected files are passed to `handleFiles`.
 *
 * @param {number} i - The index of the task in the `todos` array.
 */
function setupFileUploadListener(i) {
    const fileUpload = document.getElementById(`fileUpload${i}`);
    if (fileUpload) {
        fileUpload.addEventListener('change', () => {
            handleFiles(fileUpload.files);
        });
    }
}


/**
 * Adds drag-and-drop listeners to the edit modal's drop zone,
 * toggling its "dragover" styling and passing dropped files to
 * `handleFiles`.
 *
 * @param {number} i - The index of the task in the `todos` array.
 */
function setupDropZoneListeners(i) {
    const dropZone = document.getElementById(`dropZone${i}`);
    if (!dropZone) return;
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });
    dropZone.addEventListener('dragleave', (e) => {
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
}


/**
 * Initializes the remaining interactive controls in the edit modal:
 * category dropdown, priority button listeners and selected styling,
 * assigned contacts display, form-change tracking, and image loading.
 */
function initializeEditModalControls() {
    addEventListenerDropDown();
    addPrioEventListenersEdit();
    changeColor(document.querySelector('.button-prio-selected'));
    displayNamesOfContactsEdit();
    displayAssignedContactsInEdit();
    onInputChangeEdit();
    if (typeof loadImages === 'function') {
        loadImages();
    }
}
