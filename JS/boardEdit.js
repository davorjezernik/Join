/**
 * This function add a higlight when we mova a dropdown
 * 
 * @param {*} event 
 */
function highlight(event) {
    event.preventDefault();  
    event.currentTarget.classList.add('drag-area-highlight');
}


/**
 * This function removes a higlight when we mova a dropdown
 * 
 * @param {*} event 
 */
function removeHighlight(event) {
    event.currentTarget.classList.remove('drag-area-highlight');
}


/**
 * This function changes the color of the selected priority button
 * 
 * @param {element} clickedButton 
 */
function changeColorEdit(clickedButton) {
    const buttons = [
        { element: document.getElementById('lowButtonEdit'), class: 'lowSelectedEdit' },
        { element: document.getElementById('mediumButtonEdit'), class: 'mediumSelectedEdit' },
        { element: document.getElementById('urgentButtonEdit'), class: 'urgentSelectedEdit' }
    ];
    buttons.forEach(button => {
        if (button.element) {
            button.element.classList.toggle(button.class, button.element === clickedButton);
            if (button.element !== clickedButton) {
                button.element.classList.remove(button.class);
            }
        }
    });
}


/**
 * Adds a new subtask to the task at index `i` while in edit mode.
 * Reads the subtask text from the edit input field, ensures the task's
 * subtask list is properly initialized, inserts or appends the new
 * subtask, persists the change, and refreshes the subtask list display.
 *
 * @param {number} i - The index of the task in the `todos` array
 * being edited.
 */
function addSubtaskEdit(i) {
    const subtaskText = document.getElementById('inputFieldSubtaskEdit').value.trim();
    if (subtaskText !== '' && todos[i]) {
        ensureSubtasksArray(todos[i]);
        insertOrAppendSubtask(i, subtaskText);
        localStorage.setItem('todos', JSON.stringify(todos));
        refreshSubtaskEditView(i);
    }
    onInputChangeEdit();
}

/**
 * Ensures a task object has a valid `task.subtasks` array,
 * creating the `task` object and/or `subtasks` array if missing.
 *
 * @param {Object} todo - The task object to check/initialize.
 */
function ensureSubtasksArray(todo) {
    if (!todo.task) {
        todo.task = { subtasks: [] };
    }
    if (!Array.isArray(todo.task.subtasks)) {
        todo.task.subtasks = [];
    }
}


/**
 * Inserts a new subtask into an existing subtask's position (if one is
 * currently being edited) or appends it to the end of the task's
 * subtask list otherwise. Clears the global `editedSubtask` state
 * after an insertion.
 *
 * @param {number} i - The index of the task in the `todos` array.
 * @param {string} subtaskText - The text content of the new subtask.
 */
function insertOrAppendSubtask(i, subtaskText) {
    const newSubtask = { text: subtaskText, status: 'pending' };
    if (editedSubtask !== null) {
        todos[editedSubtask.taskIndex].task.subtasks.splice(editedSubtask.subtaskIndex, 0, newSubtask);
        editedSubtask = null;
    } else {
        todos[i].task.subtasks.push(newSubtask);
    }
}


/**
 * Re-renders the subtask list for the given task and clears the
 * subtask edit input field.
 *
 * @param {number} i - The index of the task in the `todos` array.
 */
function refreshSubtaskEditView(i) {
    const container = document.getElementById(`subtasksContainer${i}`);
    container.innerHTML = generateSubtasksEditHtml(todos[i].task.subtasks, i);
    document.getElementById('inputFieldSubtaskEdit').value = '';
}


/**
 * This function edit the subtasks and saves them in local storage
 * 
 * @param {number} taskIndex 
 * @param {number} subtaskIndex 
 */
function editSubtaskEdit(taskIndex, subtaskIndex) {
    let subtaskDiv = document.getElementById(`subtask${taskIndex}-${subtaskIndex}`);
    let text = subtaskDiv.innerHTML;
    document.getElementById('inputFieldSubtaskEdit').value = text;
    editedSubtask = { taskIndex, subtaskIndex, text };
    todos[taskIndex].task.subtasks.splice(subtaskIndex, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    refreshSubtaskEditView(taskIndex);
    onInputChangeEdit();
}


/**
 * This function dispays the edited subtask
 * 
 * @param {number} i 
 */
function displaySubtasksEdit(i) {
    const container = document.getElementById(`subtasksContainer${i}`);
    container.innerHTML = generateSubtasksEditHtml(todos[i].task.subtasks, i);
}


/**
 * This function deletes the input field for the subtask
 */
function clearSubtaskInputEdit() {
    let inputField = document.getElementById('inputFieldSubtaskEdit');
    inputField.value = '';
    if (editedSubtask !== null) {
        todos[editedSubtask.taskIndex].task.subtasks.splice(editedSubtask.subtaskIndex, 0, { text: editedSubtask.text, status: 'pending' });
        localStorage.setItem('todos', JSON.stringify(todos));
        displaySubtasksEdit(editedSubtask.taskIndex);
        editedSubtask = null;
    }
    onInputChangeEdit();
}


/**
 * This function delete the subtask
 * 
 * @param {number} taskIndex 
 * @param {number} subtaskIndex 
 */
function deleteSubtaskEdit(taskIndex, subtaskIndex) {
    let subtasks = todos[taskIndex].task.subtasks;
    subtasks.splice(subtaskIndex, 1);
    localStorage.setItem('todos', JSON.stringify(todos));
    displaySubtasksEdit(taskIndex);
}


/**
 * Saves edits made to the task at index `i`.
 * Validates the title and date, and if valid, gathers the updated
 * task data, persists it, refreshes the task list, closes the edit
 * modal, and cleans up temporary edit-related localStorage data.
 *
 * @param {number} i - The index of the task being edited, used to
 * locate its form fields and modal.
 */
async function saveTask(i) {
    const { nameEdit, descriptionEdit, dateEdit } = getTaskDetails(i);
    if (!isEditFormValid(nameEdit, dateEdit, i)) return;
    const task = buildUpdatedTask(nameEdit, descriptionEdit, dateEdit, i);
    const toBeEditedTaskId = localStorage.getItem('toBeEditedTaskId');
    await updateUserTasks(uid, toBeEditedTaskId, task);
    await displayOpenTasks();
    closeModal(document.getElementById(`myModal${i}`));
    clearEditTaskStorage();
}


/**
 * Validates the "add task" form fields and, if valid, submits the task.
 * Resets any previous validation error styling, checks the title,
 * date, and category fields, and calls `addTask()` only if all
 * fields pass validation.
 */
function validateAndAddTask() {
    resetValidationStyling();
    const isTitleValid = validateTaskTitle();
    const isDateValid = validateTaskDate();
    const isCategoryValid = validateTaskCategory();
    if (isTitleValid && isDateValid && isCategoryValid) {
        addTask();
    }
}

/**
 * Clears any error border styling previously applied to the
 * title, date, and category fields.
 */
function resetValidationStyling() {
    document.getElementById('taskTitle').style.borderColor = '';
    document.getElementById('date').style.borderColor = '';
    document.getElementById('selectCategoryContainer').style.borderColor = '';
}


/**
 * Validates the task title field, requiring at least 4 non-whitespace
 * characters. Applies error styling if invalid.
 *
 * @returns {boolean} `true` if the title is valid, `false` otherwise.
 */
function validateTaskTitle() {
    const taskTitle = document.getElementById('taskTitle');
    if (taskTitle.value.trim().length < 4) {
        taskTitle.style.borderColor = 'red';
        return false;
    }
    return true;
}


/**
 * Validates that the task date field has a value.
 * Applies error styling if invalid.
 *
 * @returns {boolean} `true` if the date is set, `false` otherwise.
 */
function validateTaskDate() {
    const date = document.getElementById('date');
    if (!date.value) {
        date.style.borderColor = 'red';
        return false;
    }
    return true;
}


/**
 * Validates that a task category has been selected (i.e. the
 * placeholder text is no longer shown). Applies error styling
 * to the category container if invalid.
 *
 * @returns {boolean} `true` if a category is selected, `false` otherwise.
 */
function validateTaskCategory() {
    const category = document.getElementById('selectCategory');
    const categoryContainer = document.getElementById('selectCategoryContainer');
    if (category.textContent === 'Select task category') {
        categoryContainer.style.borderColor = 'red';
        return false;
    }
    return true;
}