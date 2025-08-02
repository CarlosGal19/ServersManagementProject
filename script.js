document.addEventListener('DOMContentLoaded', () => {
    let taskList = getLocalStorage();
    const form = document.querySelector('form');
    const containerTasksToDo = document.querySelector('#tasks_to_do');
    const containerTasksDoing = document.querySelector('#tasks_doing');
    const containerTasksDone = document.querySelector('#tasks_done');

    const inputTitle = document.querySelector('#title')
    const inputDescription = document.querySelector('#description')
    const inputStatus = document.querySelector('#status')
    const inputImportance = document.querySelector('#importance')

    const cancelButton = document.querySelector('#cancel_button')

    let editMode = false;
    let idToEdit = null;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        saveTask(event)
    })

    cancelButton.addEventListener('click', disableEditMode);

    renderAllTasks();

    function saveTask(event) {
        const title = event.target.title.value;
        const description = event.target.description.value;
        const importance = event.target.importance.value;
        const status = event.target.status.value;

        if (editMode == false) {
            const taskId = Date.now()

            const task = {
                taskId,
                title,
                description,
                importance,
                status
            };

            taskList.push(task)

            updateLocalStorage(taskList)

            renderAllTasks();

            event.target.reset();
            return;
        }

        const indexOfTaskTEdit = taskList.findIndex(t => t.taskId == idToEdit);
        if (indexOfTaskTEdit == -1) return;

        taskList[indexOfTaskTEdit].title = title;
        taskList[indexOfTaskTEdit].description = description;
        taskList[indexOfTaskTEdit].status = status;
        taskList[indexOfTaskTEdit].importance = importance;

        disableEditMode();
        updateLocalStorage(taskList);
        renderAllTasks();
        event.target.reset();
    }

    function renderAllTasks() {
        const sortedTasksToDo = sortTasks(taskList.filter(t => t.status === "to_do"));
        const sortedTasksDoing = sortTasks(taskList.filter(t => t.status === "doing"));
        const sortedTasksDone = sortTasks(taskList.filter(t => t.status === "done"));

        const tasks = [
            { container: containerTasksToDo, list: sortedTasksToDo },
            { container: containerTasksDoing, list: sortedTasksDoing },
            { container: containerTasksDone, list: sortedTasksDone }
        ];

        tasks.forEach(t => {
            renderTasks(t.container, t.list);
        });
    }

    function renderTasks(container, tasks) {
        container.innerHTML = '';
        if (tasks.length == 0) return

        tasks.forEach(t => {
            const div = document.createElement('div');
            div.className = t.status;
            div.innerHTML = `
                <h3>${t.title}</h3>
                <p>${t.description}</p>
                <p><span class="${t.importance}">${t.importance.toUpperCase()}</span></p>
                <div class="action_buttons">
                    <button id="done-${t.taskId}">✅</button>
                    <button id="edit-${t.taskId}">✏️</button>
                    ${t.status !== 'done' ? `<button id="delete-${t.taskId}">❌</button>` : ''}
                </div>
            `;
            container.appendChild(div);

            if (t.status !== 'done') {
                const deleteBtn = div.querySelector(`#delete-${t.taskId}`);
                if (deleteBtn) {
                    deleteBtn.addEventListener('click', () => deleteTask(t.taskId));
                }
            }

            const btnCheck = div.querySelector(`#done-${t.taskId}`);
            if (btnCheck) {
                btnCheck.addEventListener('click', () => updateStatus(t.taskId));
            }

            const btnEdit = div.querySelector(`#edit-${t.taskId}`);
            if (btnEdit) {
                btnEdit.addEventListener('click', () => enableEditMode(t.taskId));
            }
        });
    }

    function updateStatus(taskId) {
        const statusOptions = ['to_do', 'doing', 'done'];
        const task = taskList.find(t => t.taskId == taskId);
        if (!task) return;

        if (task.status === 'done') {
            deleteTask(task.taskId);
            return;
        }

        const currentIndex = statusOptions.indexOf(task.status);
        const nextIndex = currentIndex + 1;

        task.status = statusOptions[nextIndex];

        updateLocalStorage(taskList);
        renderAllTasks();
    }

    function enableEditMode(taskId) {
        editMode = true;
        idToEdit = taskId;

        const taskToEdit = taskList.find(t => t.taskId == taskId);

        inputTitle.value = taskToEdit.title;
        inputDescription.value = taskToEdit.description;
        inputStatus.value = taskToEdit.status;
        inputImportance.value = taskToEdit.importance;

        form.querySelector('h2').textContent = 'Update Task'
        form.querySelector('button[type="submit"]').textContent = 'Update';
    }

    function disableEditMode() {
        editMode = false;
        idToEdit = null;

        form.querySelector('h2').textContent = 'Add Task'
        form.querySelector('button[type="submit"]').textContent = 'Add';
    }

    function deleteTask(taskId) {
        taskList = taskList.filter(t => t.taskId != taskId);

        updateLocalStorage(taskList);

        renderAllTasks()
    }

    function sortTasks(taskList) {
        const importanceOrder = {
            high: 1,
            medium: 2,
            low: 3
        };

        return taskList.sort((a, b) => {
            return importanceOrder[a.importance] - importanceOrder[b.importance];
        });
    }

    function updateLocalStorage(taskList) {
        localStorage.setItem('tasks', JSON.stringify(taskList))
    }

    function getLocalStorage() {
        return JSON.parse(localStorage.getItem('tasks')) || []
    }

});
