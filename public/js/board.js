const columnCreateButton = document.getElementById("column-create-button");
const columnCreateContainer = document.getElementById("column-create-container");

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

const handleCreateColumnButton = () => {
    const preButtonStyle = columnCreateButton.style.display;
    columnCreateButton.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter board name';
    input.id = 'boardInput';

    columnCreateContainer.appendChild(input);
    input.focus();

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            createColumn(input.value.trim());

            input.remove();
            columnCreateButton.style.display = preButtonStyle;
        }
    });
}

columnCreateButton.addEventListener('click', () => {
    handleCreateColumnButton();
})

document.addEventListener('DOMContentLoaded', () => {
    loadAllColumns().then();
});

const displayNewColumn = (columnName) => {
    const template = document.getElementById('board-column-template');
    const container = document.getElementById('column-container');
    const columnCreateContainer = document.getElementById('column-create-container');

    const columnNode = template.content.cloneNode(true);

    const titleDiv = columnNode.getElementById('title');
    if (titleDiv) {
        titleDiv.textContent = columnName;
    }

    container.insertBefore(columnNode, columnCreateContainer);
};