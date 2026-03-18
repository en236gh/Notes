document.addEventListener("DOMContentLoaded", function() {
    // Load saved notes on page load (only on index.html)
    if (document.getElementById("notes-container")) {
        loadNotes();
    }
    
    // Load deleted notes on trash page
    if (document.getElementById("trash-container")) {
        loadDeletedNotes();
        
        // Listen to restore and permanent delete button clicks
        const trashContainer = document.getElementById("trash-container");
        trashContainer.addEventListener("click", function(event) {
            if (event.target.classList.contains("restore-btn")) {
                const noteId = parseInt(event.target.getAttribute("data-id"));
                restoreNote(noteId);
            } else if (event.target.classList.contains("permanent-delete-btn")) {
                const noteId = parseInt(event.target.getAttribute("data-id"));
                permanentlyDeleteNote(noteId);
            }
        });
    }

    // Navigation - Trash button
    document.getElementById("trash").addEventListener("click", function() {
        window.location.href = "trash.html";
        
    });
    document.getElementById("home").addEventListener("click", function() {
        window.location.href = "index.html";
    });
    
    // Modal functionality (only on index.html)
    const modal = document.getElementById("noteModal");
    const addNoteBtn = document.getElementById("addNoteBtn");
    const closeBtn = document.querySelector(".close");
    const cancelBtn = document.getElementById("cancelNoteBtn");
    const saveNoteBtn = document.getElementById("saveNoteBtn");
    const noteTitleInput = document.getElementById("noteTitle");
    const noteContentInput = document.getElementById("noteContent");
    
    // Only add event listeners if elements exist (on index.html)
    if (addNoteBtn && modal) {
        let editingNoteId = null; // Track which note is being edited
        
        // Open modal when add note button is clicked
        addNoteBtn.addEventListener("click", function() {
            editingNoteId = null; // Reset editing state
            document.getElementById("modalTitle").textContent = "Add Note";
            noteTitleInput.value = "";
            noteContentInput.value = "";
            modal.style.display = "block";
        });
        
        // Close modal when X is clicked
        closeBtn.addEventListener("click", function() {
            modal.style.display = "none";
            editingNoteId = null;
        });
        
        // Close modal when Cancel is clicked
        cancelBtn.addEventListener("click", function() {
            modal.style.display = "none";
            editingNoteId = null;
        });
        
        // Close modal when clicking outside the modal
        window.addEventListener("click", function(event) {
            if (event.target == modal) {
                modal.style.display = "none";
                editingNoteId = null;
            }
        });
        
        // Save note to localStorage
        saveNoteBtn.addEventListener("click", function() {
            const title = noteTitleInput.value.trim();
            const content = noteContentInput.value.trim();
            
            if (title === "" && content === "") {
                alert("Please enter a title or content for your note.");
                return;
            }
            
            const notes = getNotesFromStorage();
            
            if (editingNoteId !== null) {
                // Update existing note
                const noteIndex = notes.findIndex(note => note.id === editingNoteId);
                if (noteIndex !== -1) {
                    notes[noteIndex].title = title || "Untitled Note";
                    notes[noteIndex].content = content;
                    notes[noteIndex].updatedAt = new Date().toISOString();
                }
            } else {
                // Create new note
                const note = {
                    id: Date.now(),
                    title: title || "Untitled Note",
                    content: content,
                    createdAt: new Date().toISOString()
                };
                notes.push(note);
            }
            
            // Save to localStorage
            localStorage.setItem("notes", JSON.stringify(notes));
            
            // Clear inputs and close modal
            noteTitleInput.value = "";
            noteContentInput.value = "";
            modal.style.display = "none";
            editingNoteId = null;
            
            // Reload notes to display
            loadNotes();
        });

        //listen to delete and edit button clicks on the notes container
        const notesContainer = document.getElementById("notes-container");
        if (notesContainer) {
            notesContainer.addEventListener("click", function(event) {
                if (event.target.classList.contains("delete-btn")) {
                    const noteId = parseInt(event.target.getAttribute("data-id"));
                    deleteNote(noteId);
                } else if (event.target.classList.contains("edit-btn")) {
                    const noteId = parseInt(event.target.getAttribute("data-id"));
                    editNote(noteId);
                }
            });
        }
        
        // Function to edit a note
        function editNote(noteId) {
            const notes = getNotesFromStorage();
            const note = notes.find(n => n.id === noteId);
            
            if (note) {
                editingNoteId = noteId;
                document.getElementById("modalTitle").textContent = "Edit Note";
                noteTitleInput.value = note.title;
                noteContentInput.value = note.content;
                modal.style.display = "block";
            }
        }
    }

});



// Function to delete a note (move to trash)
function deleteNote(noteId) {
    let notes = getNotesFromStorage();
    const noteIndex = notes.findIndex(note => note.id === noteId);

    if (noteIndex !== -1) {
        // Move note to deleted notes
        const [deletedNote] = notes.splice(noteIndex, 1);
        const deletedNotes = getDeletedNotesFromStorage();
        deletedNotes.push(deletedNote);
        localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));

        // Save updated notes
        localStorage.setItem("notes", JSON.stringify(notes));
        loadNotes();
    }
}

// Function to restore a note from trash
function restoreNote(noteId) {
    let deletedNotes = getDeletedNotesFromStorage();
    const noteIndex = deletedNotes.findIndex(note => note.id === noteId);

    if (noteIndex !== -1) {
        // Move note back to active notes
        const [restoredNote] = deletedNotes.splice(noteIndex, 1);
        const notes = getNotesFromStorage();
        notes.push(restoredNote);
        localStorage.setItem("notes", JSON.stringify(notes));

        // Save updated deleted notes
        localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
        loadDeletedNotes();
    }
}

// Function to permanently delete a note
function permanentlyDeleteNote(noteId) {
    if (confirm("Are you sure you want to permanently delete this note? This action cannot be undone.")) {
        let deletedNotes = getDeletedNotesFromStorage();
        const noteIndex = deletedNotes.findIndex(note => note.id === noteId);

        if (noteIndex !== -1) {
            deletedNotes.splice(noteIndex, 1);
            localStorage.setItem("deletedNotes", JSON.stringify(deletedNotes));
            loadDeletedNotes();
        }
    }
}

// Get notes from localStorage
function getNotesFromStorage() {
    const notes = localStorage.getItem("notes");
    return notes ? JSON.parse(notes) : [];
}

// Get deleted notes from localStorage
function getDeletedNotesFromStorage() {
    const deletedNotes = localStorage.getItem("deletedNotes");
    return deletedNotes ? JSON.parse(deletedNotes) : [];
}

// Load and display notes
function loadNotes() {
    const notesContainer = document.getElementById("notes-container");
    const notes = getNotesFromStorage();
    
    // Clear current notes
    notesContainer.innerHTML = " ";
    
    if (notes.length === 0) {
        notesContainer.innerHTML = "<p class='no-notes'>No notes yet. Click + to create one!</p>";
        return;
    }
    
    // Display each note
    notes.forEach(note => {
        const noteCard = document.createElement("div");
        noteCard.className = "note-card";
        noteCard.innerHTML = `
            <h3 class="note-title">${escapeHtml(note.title)}</h3>
            <p class="note-content">${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button class="edit-btn" data-id="${note.id}">Edit</button>
                <button class="delete-btn" data-id="${note.id}">Delete</button>
            </div>
            <small class="note-date">${new Date(note.createdAt).toLocaleDateString()}</small>
        `;
        notesContainer.appendChild(noteCard);
    });
}

// Load and display deleted notes
function loadDeletedNotes() {
    const trashContainer = document.getElementById("trash-container");
    const deletedNotes = getDeletedNotesFromStorage();
    
    // Clear current notes
    trashContainer.innerHTML = " ";
    
    if (deletedNotes.length === 0) {
        trashContainer.innerHTML = "<p class='no-notes'>Trash is empty.</p>";
        return;
    }
    
    // Display each deleted note
    deletedNotes.forEach(note => {
        const noteCard = document.createElement("div");
        noteCard.className = "note-card";
        noteCard.innerHTML = `
            <h3 class="note-title">${escapeHtml(note.title)}</h3>
            <p class="note-content">${escapeHtml(note.content)}</p>
            <div class="note-actions">
                <button class="restore-btn" data-id="${note.id}">Restore</button>
                <button class="permanent-delete-btn" data-id="${note.id}">Delete Forever</button>
            </div>
            <small class="note-date">${new Date(note.createdAt).toLocaleDateString()}</small>
        `;
        trashContainer.appendChild(noteCard);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
