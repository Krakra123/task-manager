const columnCreateButton = document.getElementById("column-create-button");
const columnCreationContainer = document.getElementById("column-creation-container");

const createColumn = (columnName) => {
    fetch('/board/create-col', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({columnName})
    })
        .then(response => {
            if (!response.ok) throw new Error('Request failed');
            return response.text();
        })
        .catch(err => {
            alert('Error: ' + err.message);
        });

    displayNewColumn(columnName);
}

const loadAllColumns = async () => {
    fetch('/board/get-all-cols', {
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
            data.columns.forEach(column => {
                displayNewColumn(column.title);
            });
        })
        .catch(err => {
            console.error("Error loading columns:", err);
        });
}

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
            createColumn(input.value.trim());

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

const handleAddTask = (column) => {
    const template = document.getElementById('task-creation-template');
    const node = template.content.cloneNode(true);
    const input = node.getElementById('task-creation-input');

    column.appendChild(node);
    input.focus();

    const insertedElement = column.querySelector('.task-creation')
    input.addEventListener('blur', () => {
        displayNewTask(column, input.value.trim());

        insertedElement.remove();
    });
    input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            input.blur();
        }
    });
}

document.addEventListener('click', function (event) {
    if (event.target.closest('#task-add-button')) {
        const button = event.target.closest('#task-add-button');
        const column = button.closest('.board-column');
        handleAddTask(column);
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadAllColumns().then();
});

const displayNewColumn = (columnName) => {
    const template = document.getElementById('board-column-template');

    const columnNode = template.content.cloneNode(true);
    const titleDiv = columnNode.getElementById('title');

    titleDiv.textContent = columnName;

    const container = document.getElementById('column-container');
    container.insertBefore(columnNode, columnCreationContainer);
};

const displayNewTask = (column, taskName) => {
    const template = document.getElementById('task-template');

    const taskNode = template.content.cloneNode(true);
    const titleDiv = taskNode.getElementById('title');

    titleDiv.textContent = taskName;

    const container = column.querySelector('.task-container');
    container.appendChild(taskNode);
}