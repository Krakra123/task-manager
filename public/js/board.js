const columnCreateButton = document.getElementById("column-create-button");
const columnCreationContainer = document.getElementById("column-creation-container");
const columnContainer = document.getElementById("column-container");

// FETCHING TO BACKEND ==========================
const createColumn = async (columnName) => {
    await fetch('/board/create-col', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({columnName})
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            const columnID = data._id;
            displayNewColumn(columnName, columnID);
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
}

const loadAllColumns = async () => {
    await fetch('/board/get-all-cols', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        }
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            data.forEach(column => {
                displayNewColumn(column.title, column._id);
                loadAllTaskInColumn(column._id);
            });
        })
        .catch(err => {
            console.error("Error loading columns:", err);
        });
}

const createTaskInColumn = async (columnID, taskName) => {
    await fetch('/task/create-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({columnID, taskName})
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            displayNewTask(columnID, data.title, data._id);
        })
        .catch(err => {
            console.error("Error creating task:", err);
        })
}

const loadAllTaskInColumn = async (columnID) => {
    await fetch('/task/get-all-task-in-column', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({columnID})
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            data.forEach(task => {
                displayNewTask(columnID, task.title, task._id);
            })
        })
        .catch(err => {
            console.error("Error loading task in column:", err);
        })
}

const moveTask = async (taskID, columnID, index) => {
    await fetch('/task/move-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({taskID, columnID, index})
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {

        })
        .catch(err => {
            console.error("Error move task:", err);
        })
}

// HANDLE COLUMN CREATION ==========================
columnCreateButton.addEventListener('click', (event) => {
    const preButtonStyle = columnCreateButton.style.display;
    columnCreateButton.style.display = 'none';

    const template = document.getElementById('board-column-creation-template');
    const node = template.content.cloneNode(true);
    const input = node.getElementById('board-column-creation-input');

    columnCreationContainer.appendChild(node);
    input.focus();

    const insertedElement = columnCreationContainer.querySelector('.board-column-creation')
    input.addEventListener('blur', () => {
        if (insertedElement) {
            if (input.value !== '') {
                createColumn(input.value.trim());
            }

            insertedElement.remove();
            columnCreateButton.style.display = preButtonStyle;
        }
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });
})

// HANDLE TASK CREATION==========================
const handleAddTask = (column) => {
    const template = document.getElementById('task-creation-template');
    const node = template.content.cloneNode(true);
    const input = node.getElementById('task-creation-input');

    column.appendChild(node);
    input.focus();

    const insertedElement = column.querySelector('.task-creation')
    input.addEventListener('blur', () => {
        if (input.value.trim() !== '') {
            const columnID = column.getAttribute('data-id');
            createTaskInColumn(columnID, input.value.trim());
        }

        insertedElement.remove();
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });
}

// HANDLE TASK DELETION ==========================
const handleDeleteTask = async (task) => {
    const taskID = task.getAttribute('data-id');
    await fetch('/task/delete-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({taskID})
    })
    task.remove();
}

// HANDLE TASK DRAG AND DROP ==========================
const makeColumnDroppable = (column) => {
    const container = column.querySelector(".task-container");
    container.addEventListener("dragover", handleTaskDragover);
    container.addEventListener("drop", handleTaskDrop);
}
const makeTaskDraggable = (task) => {
    task.setAttribute("draggable", "true");
    task.addEventListener("dragstart", handleTaskDragStart);
    task.addEventListener("dragend", handleTaskDragEnd);
    // task.addEventListener("dragover", handleTaskDragover);
    // task.addEventListener("drop", handleTaskDrop);
    return task;
}
const handleTaskDragStart = (event) => {
    event.dataTransfer.effectsAllowed = "move";
    event.dataTransfer.setData("text/plain", "");
    requestAnimationFrame(() => {
        event.target.className = "task-dragging";
        event.target.classList.add("dragging");
    });
}
const handleTaskDragEnd = (event) => {
    event.target.className = "task";
    // event.target.classList.remove("dragging");
}
const handleTaskDragover = (event) => {
    event.preventDefault(); // allow drop

    const draggedTask = document.querySelector(".dragging");
    const target = event.target.closest(".task, .task-container");

    if (!target || target === draggedTask) return;

    if (target.classList.contains("task-container")) {
        const lastTask = target.lastElementChild;
        if (!lastTask) {
            target.appendChild(draggedTask);
        } else {
            const {bottom} = lastTask.getBoundingClientRect();
            event.clientY > bottom && target.appendChild(draggedTask);
        }
    } else {
        const {top, height} = target.getBoundingClientRect();
        const distance = top + height / 2;

        if (event.clientY < distance) {
            target.before(draggedTask);
        } else {
            target.after(draggedTask);
        }
    }
};
const handleTaskDrop = async (event) => {
    event.preventDefault();

    const draggedTask = document.querySelector(".dragging");
    const target = event.target.closest(".task, .task-container");

    if (!target || target === draggedTask) return;

    const container = draggedTask.parentElement;
    console.log(container, Array.from(container.children).indexOf(draggedTask));
    await moveTask(draggedTask.getAttribute('data-id'),
        container.getAttribute('data-id'),
        Array.from(container.children).indexOf(draggedTask));
}

// HANDLE ELEMENT CLICKING ON ==========================
document.addEventListener('click', function (event) {
    if (event.target.closest('#task-add-button')) {
        const button = event.target.closest('#task-add-button');
        const column = button.closest('.board-column');
        handleAddTask(column);
    }

    if (event.target.closest('.task-delete-button')) {
        const button = event.target.closest('.task-delete-button');
        const task = button.closest('.task');
        handleDeleteTask(task);
    }
});

// EVENT START LOADING ==========================
document.addEventListener('DOMContentLoaded', () => {
    loadAllColumns().then();
});

// DISPLAYING DATA TO FRONTEND ==========================
const displayNewColumn = (columnName, columnID) => {
    const template = document.getElementById('board-column-template');

    const columnNode = template.content.cloneNode(true);
    const column = columnNode.querySelector('.board-column');
    const titleDiv = columnNode.getElementById('title');

    titleDiv.textContent = columnName;

    const container = document.getElementById('column-container');
    container.insertBefore(columnNode, columnCreationContainer);

    column.setAttribute('data-id', columnID);
    column.querySelector('.task-container').setAttribute('data-id', columnID);

    makeColumnDroppable(column);
};

const displayNewTask = (columnID, taskName, taskID) => {
    const template = document.getElementById('task-template');

    const taskNode = template.content.cloneNode(true);
    const task = taskNode.querySelector('.task');
    const titleDiv = taskNode.getElementById('title');

    titleDiv.textContent = taskName;

    const column = document.querySelector(`[data-id="${columnID}"]`);
    const container = column.querySelector('.task-container');
    container.appendChild(task);

    task.setAttribute('data-id', taskID);

    makeTaskDraggable(task);
}