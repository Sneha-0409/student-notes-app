let notes = (JSON.parse(localStorage.getItem("notes")) || []).map(n => 
    typeof n === 'string' ? { text: n, date: "Created: " + new Date().toLocaleString() } : n
);

const THEME_KEY = "theme";

displayNotes();
initTheme();

function addNote() {
    let input = document.getElementById("noteInput");
    let titleInput = document.getElementById("noteTitle");
    let tagsInput = document.getElementById("noteTags");
    let subjectInput = document.getElementById("noteSubject");
    
    let noteText = input.value.trim();
    let titleText = titleInput.value.trim();

    if(noteText === ""){
        alert("Please enter a note");
        return;
    }

    notes.push({ 
        text: noteText, 
        title: titleText,
        tags: tagsInput.value,
        subject: subjectInput.value,
        date: "Created: " + new Date().toLocaleString() 
    });

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

    input.value = "";
    titleInput.value = "";
    tagsInput.value = "";
    subjectInput.value = "";

    displayNotes();
}

function displayNotes(){
    let container = document.getElementById("notesContainer");
    container.innerHTML = "";

    if (notes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>No notes found. Start by adding your first note above!</p>
            </div>
        `;
        return;
    }

    notes.forEach((note,index)=>{
        const tagsHtml = note.tags ? note.tags.split(',').map(t => `<span class="note-tag">#${t.trim()}</span>`).join('') : '';
        
        container.innerHTML += `
            <div class="note">
                <div class="note-actions">
                    <button class="icon-btn edit-btn" onclick="editNote(${index})" aria-label="Edit">✎</button>
                    <button class="icon-btn delete-btn" onclick="deleteNote(${index})" aria-label="Delete">✕</button>
                </div>
                ${note.title ? `<strong class="note-title">${escapeHtml(note.title)}</strong>` : ''}
                <div class="note-text">${escapeHtml(note.text)}</div>
                <div class="note-footer" style="margin-top:10px">
                    ${tagsHtml}
                </div>
                <div class="note-date">${note.date}</div>
            </div>
        `;
    });
}

function editNote(index){
    let newNote = prompt("Edit your note:", notes[index].text);
    if(newNote !== null && newNote.trim() !== ""){
        let trimmedNote = newNote.trim();
        
        if (notes.some((n, i) => n.text === trimmedNote && i !== index)) {
            alert("A note with this text already exists!");
            return;
        }

        notes[index] = { text: trimmedNote, date: "Edited: " + new Date().toLocaleString() };
        localStorage.setItem("notes", JSON.stringify(notes));
        displayNotes();
    }
}

function sortNotes() {
    const sortOrder = document.getElementById("sortOrder").value;
    if (sortOrder === "asc") {
        notes.sort((a, b) => a.text.localeCompare(b.text));
    } else if (sortOrder === "desc") {
        notes.sort((a, b) => b.text.localeCompare(a.text));
    }

    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
}

function deleteNote(index){
    notes.splice(index,1);

    localStorage.setItem(
        "notes",
        JSON.stringify(notes)
    );

    displayNotes();
}

function initTheme(){
    const toggleBtn = document.getElementById("themeToggle");

    const savedTheme = localStorage.getItem(THEME_KEY); // "light" | "dark" | null
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Priority: saved preference -> system -> light
    const initialTheme = savedTheme === "dark" || savedTheme === "light"
        ? savedTheme
        : (systemPrefersDark ? "dark" : "light");

    applyTheme(initialTheme, false);

    if(toggleBtn){
        toggleBtn.addEventListener('click', () => {
            const current = document.documentElement.getAttribute('data-theme') || 'light';
            const next = current === 'dark' ? 'light' : 'dark';
            applyTheme(next, true);
        });
    }
}

function applyTheme(theme, persist){
    document.documentElement.setAttribute('data-theme', theme);

    if(persist){
        localStorage.setItem(THEME_KEY, theme);
    }

    // Update toggle icon for better UX
    const sunIcon = document.querySelector('.theme-icon--sun');
    const moonIcon = document.querySelector('.theme-icon--moon');

    if(sunIcon && moonIcon){
        if(theme === 'dark'){
            sunIcon.style.display = 'none';
            moonIcon.style.display = 'inline';
        } else {
            sunIcon.style.display = 'inline';
            moonIcon.style.display = 'none';
        }
    }
}

// Basic XSS protection since we render notes as HTML via innerHTML.
function escapeHtml(str){
    return String(str)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '<')
        .replaceAll('>', '>')
        .replaceAll('"', '"')
        .replaceAll("'", '&#039;');
}