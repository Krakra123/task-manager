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

const deleteColumn = async (columnID) => {
    await fetch('/board/delete-col', {
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
        .then(() => {
            document.querySelector(`[data-id="${columnID}"]`).remove();
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });
};

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
    // event.dataTransfer.effectsAllowed = "move";
    requestAnimationFrame(() => {
        event.target.classList.remove("task");
        event.target.classList.add("task-dragging");
        event.target.classList.add("dragging");
    });
}
const handleTaskDragEnd = (event) => {
    event.target.classList.remove("task-dragging");
    event.target.classList.add("task");
    event.target.classList.remove("dragging");
}
const handleTaskDragover = (event) => {
    event.preventDefault(); // allow drop

    const draggedTask = document.querySelector(".task-dragging");
    const target = event.target.closest(".task, .task-container");

    if (!draggedTask || !target || target === draggedTask) return;

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

    const draggedTask = document.querySelector(".task-dragging");
    const target = event.target.closest(".task, .task-container");

    if (!draggedTask || !target || target === draggedTask) return;

    const container = draggedTask.parentElement;
    await moveTask(draggedTask.getAttribute('data-id'),
        container.getAttribute('data-id'),
        Array.from(container.children).indexOf(draggedTask));
}

// HANDLE COLUMN DRAG AND DROP ==========================
const makeColumnDraggable = (column) => {
    const draggable = column.querySelector(".column-draggable");
    draggable.setAttribute("draggable", "true");
    draggable.addEventListener("dragstart", handleColumnDragStart);
    draggable.addEventListener("dragend", handleColumnDragEnd);
};

const handleColumnDragStart = (event) => {
    const column = event.target.parentElement;
    column.className = "board-column-dragging";
    column.classList.add("dragging");
};

const handleColumnDragEnd = async (event) => {
    const column = event.target.parentElement;
    console.log(column.className);
    column.className = "board-column";
    await saveColumnOrder();
};

const handleColumnDragOver = (event) => {
    event.preventDefault();

    const container = document.getElementById("column-container");
    const draggedColumn = container.querySelector(`.board-column-dragging`);
    const draggedColumnId = draggedColumn.getAttribute('data-id');
    const targetColumn = event.target.closest(".board-column");

    if (!targetColumn || targetColumn.getAttribute("data-id") === draggedColumnId) return;
    if (targetColumn.getAttribute('data-id') === draggedColumnId) return

    const {left, width} = targetColumn.getBoundingClientRect();
    const distance = left + width / 2;

    if (event.clientX < distance) {
        container.insertBefore(draggedColumn, targetColumn);
    } else {
        const nextTargetColumn = targetColumn.nextSibling;
        if (nextTargetColumn) {
            container.insertBefore(draggedColumn, targetColumn.nextSibling);
        } else {
            container.appendChild(draggedColumn);
        }
    }
};

const handleColumnDrop = (event) => {
    event.preventDefault();
    //
    // const draggedColumnId = event.dataTransfer.getData("column-id");
    // const targetColumn = event.target.closest(".board-column");
    //
    // if (!targetColumn || targetColumn.getAttribute("data-id") === draggedColumnId) return;
    //
    // const container = document.getElementById("column-container");
    // const draggedColumn = container.querySelector(`[data-id="${draggedColumnId}"]`);
    //
    // const {top, width} = targetColumn.getBoundingClientRect();
    // const distance = top + width / 2;
    //
    // if (event.clientY < distance) {
    //     container.insertBefore(draggedColumn, targetColumn);
    // } else {
    //     container.insertBefore(draggedColumn, targetColumn.nextSibling);
    // }
};

const saveColumnOrder = async () => {
    const container = document.getElementById("column-container");
    const columnOrder = Array.from(container.children)
        .filter(child => child.classList.contains("board-column"))
        .map(column => column.getAttribute("data-id"));

    await fetch('/board/update-column-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({columnOrder})
    }).catch(err => console.error("Error saving column order:", err));
};

document.addEventListener("DOMContentLoaded", () => {
    const columnContainer = document.querySelector('.column-container');
    columnContainer.addEventListener("dragover", handleColumnDragOver);
    columnContainer.addEventListener("drop", handleColumnDrop);

    const columns = document.querySelectorAll(".board-column");
    columns.forEach(column => {
        const container = column.querySelector(".task-container");
        container.addEventListener("dragover", handleTaskDragover);
        container.addEventListener("drop", handleTaskDrop);
    });
});

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
    } else {
        const clickedTask = event.target.closest('.task');
        if (clickedTask) {
            loadEditTaskForm(clickedTask.getAttribute('data-id')).then((task) => {
            });
        }
    }
});

// EVENT START LOADING ==========================
document.addEventListener('DOMContentLoaded', () => {
    loadAllBoards();
    loadAllColumns().then();

    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlayToggle = document.getElementById('sidebar-overlay');
    const sidebar = document.getElementById('sidebar');

    sidebarToggle.classList.remove('hidden');
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('show');
        sidebarOverlayToggle.classList.toggle('hidden');
    });

    sidebarOverlayToggle.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        sidebar.classList.toggle('show');
        sidebarOverlayToggle.classList.toggle('hidden');
    });
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

    makeColumnDraggable(column); // Make the new column draggable
    column.addEventListener("dragover", (event) => event.preventDefault());
    column.addEventListener("drop", handleColumnDrop);

    makeColumnDroppable(column);

    column.querySelectorAll('.column-menu-button').forEach(menuButton => {
        menuButton.addEventListener('click', () => {
            const menu = menuButton.nextElementSibling;
            menu.classList.toggle('hidden');
        });
    });

    column.querySelectorAll('.column-edit-button').forEach(editButton => {
        editButton.addEventListener('click', async () => {
            const title = column.querySelector('#title');
            const oldTitle = title.innerText;
            const columnID = editButton.closest('.board-column').dataset.id;

            // Replace title with an input
            const input = document.createElement('input');
            input.type = 'text';
            input.value = oldTitle;
            input.className = 'edit-title-input';
            title.replaceWith(input);

            // Handle Enter key
            input.addEventListener('keydown', async (e) => {
                if (e.key === 'Enter') {
                    const newTitle = input.value.trim();
                    if (!newTitle) return;

                    // POST to server
                    await fetch('/board/edit-col', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ columnID, newTitle })
                    });

                    // Reload page after editing
                    window.location.reload();
                }
            });

            input.focus();
        });
    });

    column.querySelectorAll('.column-delete-button').forEach(deleteButton => {
        deleteButton.addEventListener('click', async () => {
            const columnID = deleteButton.closest('.board-column').dataset.id;

            if (confirm("Are you sure you want to delete this column?")) {
                await fetch('/board/delete-col', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ columnID })
                });

                // Reload page after deleting
                window.location.reload();
            }
        });
    });
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

    fetch('/task/get-bind-user-of-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({taskID})
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            const member = data;
            fetch('/api/session')
                .then(res => res.json())
                .then(data => {
                    const exists = member.some(user => user.username === data.user);
                    if (exists) {
                        const task = document.querySelector(`[data-id="${taskID}"]`);
                        task.classList.add('assign-mark');
                    }
                })

        })
        .catch(err => {
            alert('Error: ' + err.message);
        });

    makeTaskDraggable(task);
}

const loadEditTaskForm = async (taskID) => {
    fetch('/task/get-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({taskID})
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.json();
        })
        .then(data => {
            const {title, description} = data;

            const template = document.getElementById('task-edit-form-template');
            const clone = template.content.cloneNode(true);

            const overlay = clone.querySelector('.task-edit-form-overlay');
            const form = clone.querySelector('.task-edit-form');

            form.querySelector('.taskID').value = taskID;
            form.querySelector('.title').value = title;
            form.querySelector('.task-desc').value = description;

            document.body.appendChild(overlay);
            loadTaskMember(taskID);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) overlay.remove();
            });

            const generateDes = document.querySelector('.des-gen');
            generateDes.removeEventListener('click', (e) => {
            });
            const message = 'What capital of France'; // TODO
            generateDes.addEventListener('click', () => {
                makegenerateDes(taskID);
            })
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });


}

const createButton = document.getElementById('board-create-button');
const boardList = document.querySelector('.board-list');


const loadAllBoards = async () => {
    try {
        const response = await fetch('/board/get-all-boards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) throw new Error('Failed to fetch boards');

        const boardTitles = await response.json();
        const boardList = document.querySelector('.board-list');

        // Clear any previous content
        boardList.innerHTML = '';

        boardTitles.forEach(title => {
            displayNewBoardOnSidebar(title, boardList);
        });

    } catch (err) {
        console.error('Error loading boards:', err.message);
    }
};

const displayNewBoardOnSidebar = (title, boardList) => {
    const li = document.createElement('li');
    li.classList.add('board-list-item');

    const titleSpan = document.createElement('span');
    titleSpan.textContent = title;
    titleSpan.classList.add('board-title');

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '🗑';
    deleteBtn.classList.add('delete-board-button');

    deleteBtn.addEventListener('click', async () => {
        try {
            fetch('/board/delete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({boardName: title}),
            })
                .then(response => {
                    if (!response.ok) throw new Error('Request failed');
                    return response.json();
                })
                .then(data => {
                    if (data.gonnaReload) window.location.href = '/board'
                    li.remove(); // remove from UI if successful
                })
        } catch (err) {
            alert('Error: ' + err.message);
        }
    });

    titleSpan.addEventListener('click', async () => {
        try {
            fetch('/board/switch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({title}),
            })
                .then(() => {
                    window.location.href = '/board'
                })
                .catch(err => {
                    alert('Error: ' + err.message);
                });
        } catch (err) {
            alert('Error: ' + err.message);
        }
    })

    li.appendChild(titleSpan);
    li.appendChild(deleteBtn);
    boardList.appendChild(li);
}

createButton.addEventListener('click', () => {
    // Prevent multiple inputs
    if (boardList.querySelector('.board-name-input')) return;

    const li = document.createElement('li');
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter board name...';
    input.classList.add('board-name-input');

    li.appendChild(input);
    boardList.appendChild(li);
    input.focus();

    input.addEventListener('keydown', async (event) => {
        if (event.key === 'Enter') {
            const boardName = input.value.trim();
            if (!boardName) return;

            try {
                const response = await fetch('/board/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({boardName})
                });

                if (!response.ok) {
                    const err = await response.json();
                    alert(err.error || 'Failed to create board');
                    return;
                }

                const data = await response.json();

                displayNewBoardOnSidebar(data.board.title, boardList);
                input.remove();
            } catch (err) {
                alert('Error: ' + err.message);
            }
        } else if (event.key === 'Escape') {
            li.remove(); // Cancel on Escape
        }
    });
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function loadTaskMember(taskID) {
    const nonBindMemberResponse = await fetch('/task/get-nonbind-user-of-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({taskID})
    })
    const nonBindMembers = await nonBindMemberResponse.json();

    const bindMemberResponse = await fetch('/task/get-bind-user-of-task', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({taskID})
    })
    const bindMembers = await bindMemberResponse.json();

    await loadAssignedMembers(taskID, bindMembers);
    await loadUnassignedMembers(taskID, nonBindMembers);
}

const createMemberButton = (taskID, name, isAssigned) => {
    const assignedBox = document.querySelector('.assigned-members');
    const unassignedBox = document.querySelector('.unassigned-members');

    const button = document.createElement('button');
    button.textContent = name;
    button.classList.add('member-button');

    button.addEventListener('click', () => {
        if (isAssigned) {
            assignedBox.removeChild(button);
            unassignedBox.appendChild(createMemberButton(taskID, name, false));

            fetch('/task/unbind-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userID: name, taskID})
            }).then(() => {
            })
        } else {
            unassignedBox.removeChild(button);
            assignedBox.appendChild(createMemberButton(taskID, name, true));

            fetch('/task/bind-user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userID: name, taskID})
            }).then(() => {
            })
        }
    });

    return button;
};

async function loadAssignedMembers(taskID, memberNames) {
    const assignedBox = document.querySelector('.assigned-members');
    assignedBox.innerHTML = ''; // Clear old content
    memberNames.forEach(member => {
        const btn = createMemberButton(taskID, member.username, true);
        assignedBox.appendChild(btn);
    });
}

async function loadUnassignedMembers(taskID, memberNames) {
    const unassignedBox = document.querySelector('.unassigned-members');
    unassignedBox.innerHTML = ''; // Clear old content
    memberNames.forEach(member => {
        const btn = createMemberButton(taskID, member.username, false);
        unassignedBox.appendChild(btn);
    });
}

async function makegenerateDes(taskID) {
    const res = await fetch('/get-board-data', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: taskID})
    })
        .then(res => res.text())
        .then(async data => {
            let prompt = 'You are an expert project assistant specializing in task management.\n' +
                'Given a Kanban board\'s data, your role is to fill in clear, complete, and helpful task descriptions for each task that is missing or incomplete.';
            prompt += 'Please remember only answer the task description that are need to fill/change, do not answer anything other than that.';
            prompt += '\n\n';
            prompt += `Here can you fill the description of the task: \n${data}`;

            prompt += '\n\nPlease remember only answer the task description that are need to fill/change, do not answer anything other than that: Do not try to title it, just answer plain description without any thing else'


            await makeAIResponse(prompt)
                .then(data => {
                    const taskDesc = document.querySelector('.task-desc');
                    taskDesc.value = data.reply;
                });
        })
}

const makeAIResponse = async (message) => {
    try {
        const response = await fetch('/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({message})
        });

        if (!response.ok) throw new Error('Request failed');

        return await response.json();  // Return the data to be used later
    } catch (err) {
        alert('Error: ' + err.message);  // Handle errors
    }
};