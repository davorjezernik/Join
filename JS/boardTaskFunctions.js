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
    await deleteUserTask(uid, taskId);
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
async function editTask(i) {
    let userData = await loadSpecificUserDataFromLocalStorage();
    let tasks = userData.tasks;
    const modalContentEdit = document.getElementById(`modal${i}`);
    const task = todos[i]['task'];
    const contacts = todos[i]['task']['contacts'];
    if (contacts) {
        localStorage.setItem('toBeEditedAssignedContacts', JSON.stringify(contacts));
    } else {
        localStorage.setItem('toBeEditedAssignedContacts', JSON.stringify(emptyArray));
    }
    const dragCategory = todos[i]['task']["dragCategory"];
    localStorage.setItem('toBeEditedDragCategory', JSON.stringify(dragCategory));
    const category = todos[i]['task']["category"];
    localStorage.setItem('toBeEditedCategory', JSON.stringify(category));
    const priority = todos[i]['task']["priority"];
    localStorage.setItem('toBeEditedPriority', JSON.stringify(priority));
    const allImages = todos[i]['task']["allImages"];
    if (allImages) {
        localStorage.setItem('allImages', JSON.stringify(allImages));
    } else {
        localStorage.removeItem('allImages');
    }
    let title = task.name;
    let description = task.description;
    localStorage.setItem('toBeEditedTaskId', todos[i].id);
    modalContentEdit.innerHTML = generateEditModalContent(task, i);
    const fileUpload = document.getElementById(`fileUpload${i}`);
    const dropZone = document.getElementById(`dropZone${i}`);
    window.gallery = document.getElementById(`gallery${i}`);
    if (typeof gallery !== 'undefined') gallery = window.gallery;
    window.loadImages();
    if (fileUpload) {
        fileUpload.addEventListener('change', () => {
            handleFiles(fileUpload.files);
        });
    }
    if (dropZone) {
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
