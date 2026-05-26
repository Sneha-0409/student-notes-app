let notes = JSON.parse(localStorage.getItem("notes")) || [];

// Data Migration
notes = notes.map((note, index) => {
    if (typeof note === "string") {
        return { id: Date.now() + index, text: note, status: 'todo', pinned: false, dueDate: "" };
    }
    if (note.pinned === undefined) {
        note.pinned = false;
    }
    if (note.dueDate === undefined) {
        note.dueDate = "";
    }
    return note;
});
localStorage.setItem("notes", JSON.stringify(notes));

let currentView = "list"; // default view

displayNotes();

function toggleView() {
    currentView = currentView === "list" ? "board" : "list";
    let btn = document.getElementById("toggleViewBtn");
    btn.innerText = currentView === "list" ? "Switch to Board View" : "Switch to List View";
    
    let listContainer = document.getElementById("notesContainer");
    let boardContainer = document.getElementById("kanbanBoard");

    if (currentView === "list") {
        listContainer.classList.remove("hidden");
        boardContainer.classList.add("hidden");
    } else {
        listContainer.classList.add("hidden");
        boardContainer.classList.remove("hidden");
    }
    
    displayNotes();
}

function addNote() {
    let input = document.getElementById("noteInput");
    let dateInput = document.getElementById("dueDateInput");
    let noteText = input.value.trim();
    let dueDate = dateInput.value;

    if(noteText === ""){
        alert("Please enter a note");
        return;
    }

    let newNote = {
        id: Date.now(),
        text: noteText,
        status: 'todo',
        pinned: false,
        dueDate: dueDate
    };

    notes.push(newNote);

    localStorage.setItem("notes", JSON.stringify(notes));
    input.value = "";
    dateInput.value = "";
    displayNotes();
}

function displayNotes(){
    const sortedNotes = [...notes].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

    if (currentView === "list") {
        let container = document.getElementById("notesContainer");
        container.innerHTML = "";
        sortedNotes.forEach((note) => {
            container.innerHTML += createNoteHTML(note);
        });
    } else {
        let todoContainer = document.querySelector("#todo .kanban-content");
        let doingContainer = document.querySelector("#doing .kanban-content");
        let doneContainer = document.querySelector("#done .kanban-content");
        
        todoContainer.innerHTML = "";
        doingContainer.innerHTML = "";
        doneContainer.innerHTML = "";

        sortedNotes.forEach((note) => {
            let html = createNoteHTML(note);
            if (note.status === 'todo') todoContainer.innerHTML += html;
            else if (note.status === 'doing') doingContainer.innerHTML += html;
            else if (note.status === 'done') doneContainer.innerHTML += html;
            else todoContainer.innerHTML += html; // fallback
        });
    }
}

function getDueDateBadgeHTML(dueDate) {
    if (!dueDate) return "";
    
    let today = new Date();
    today.setHours(0, 0, 0, 0);
    let due = new Date(dueDate);
    due.setHours(0, 0, 0, 0);
    
    let diffTime = due - today;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
        return `<span class="date-badge date-badge-overdue">🔴 Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? 's' : ''}!</span>`;
    } else if (diffDays === 0) {
        return `<span class="date-badge date-badge-today">🟡 Due Today!</span>`;
    } else {
        return `<span class="date-badge date-badge-due">🟢 Due in ${diffDays} day${diffDays > 1 ? 's' : ''}</span>`;
    }
}

function createNoteHTML(note) {
    let badgeHTML = getDueDateBadgeHTML(note.dueDate);
    return `
        <div class="note ${note.pinned ? 'pinned' : ''}" draggable="true" ondragstart="dragStart(event, ${note.id})">
            ${note.text}
            ${badgeHTML}
            <button class="pin-btn ${note.pinned ? 'active' : ''}" onclick="togglePin(${note.id})" title="Pin to top">📌</button>
            <button class="delete-btn" onclick="deleteNote(${note.id})">X</button>
        </div>
    `;
}

function togglePin(id) {
    let note = notes.find(n => n.id === id);
    if (note) {
        note.pinned = !note.pinned;
        localStorage.setItem("notes", JSON.stringify(notes));
        displayNotes();
    }
}

function deleteNote(id){
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
}

// Drag and Drop Logic
function dragStart(event, id) {
    event.dataTransfer.setData("text/plain", id);
    // Use timeout to hide the element while dragging for better visual
    setTimeout(() => {
        event.target.classList.add("dragging");
    }, 0);
}

document.addEventListener("dragend", (event) => {
    if (event.target.classList.contains("note")) {
        event.target.classList.remove("dragging");
    }
});

function allowDrop(event) {
    event.preventDefault();
    let column = event.target.closest('.kanban-column');
    if (column) {
        column.classList.add("drag-over");
    }
}

function dragLeave(event) {
    let column = event.target.closest('.kanban-column');
    if (column) {
        column.classList.remove("drag-over");
    }
}

function drop(event) {
    event.preventDefault();
    let column = event.target.closest('.kanban-column');
    if (column) {
        column.classList.remove("drag-over");
        let newStatus = column.getAttribute('data-status');
        let noteId = parseInt(event.dataTransfer.getData("text/plain"));
        
        let note = notes.find(n => n.id === noteId);
        if (note) {
            let oldStatus = note.status;
            note.status = newStatus;
            localStorage.setItem("notes", JSON.stringify(notes));
            displayNotes();

            if (oldStatus !== 'done' && newStatus === 'done') {
                showToast("🎉 Congratulations on completing a task!");
            }
        }
    }
}

function showToast(message) {
    let container = document.getElementById("toastContainer");
    if (!container) return;

    let toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    
    container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add("show");
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}