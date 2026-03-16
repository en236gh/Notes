document.addEventListener("DOMContentLoaded", function() {
    // Load saved notes on page load
    loadNotes();

    // Navigation - Trash button
    document.getElementById("trash").addEventListener("click", function() {
        window.location.href = "trash.html";
    });
    document.getElementById("home").addEventListener("click", function() {
        window.location.href = "index.html";
    });
    
    // Modal functionality
    const modal = document.getElementById("noteModal");
    const addNoteBtn = document.getElementById("addNoteBtn");
    const closeBtn = document.querySelector(".close");
    const cancelBtn = document.getElementById("cancelNoteBtn");
    const saveNoteBtn = document.getElementById("saveNoteBtn");
    const noteTitleInput = document.getElementById("noteTitle");
    const noteContentInput = document.getElementById("noteContent");
    
    // Open modal when add note button is clicked
    addNoteBtn.addEventListener("click", function() {
        modal.style.display = "block";
    });
    
    // Close modal when X is clicked
    closeBtn.addEventListener("click", function() {
        modal.style.display = "none";
    });
    
    // Close modal when Cancel is clicked
    cancelBtn.addEventListener("click", function() {
        modal.style.display = "none";
    });
    
    // Close modal when clicking outside the modal
    window.addEventListener("click", function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
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
        
        // Create note object
        const note = {
            id: Date.now(),
            title: title || "Untitled Note",
            content: content,
            createdAt: new Date().toISOString()
        };
        
        // Get existing notes from localStorage
        const notes = getNotesFromStorage();
        notes.push(note);
        
        // Save to localStorage
        localStorage.setItem("notes", JSON.stringify(notes));
        
        // Clear inputs and close modal
        noteTitleInput.value = "";
        noteContentInput.value = "";
        modal.style.display = "none";
        
        // Reload notes to display
        loadNotes();
    });
});

// Get notes from localStorage
function getNotesFromStorage() {
    const notes = localStorage.getItem("notes");
    return notes ? JSON.parse(notes) : [];
}

// Load and display notes
function loadNotes() {
    const notesContainer = document.getElementById("notes-container");
    const notes = getNotesFromStorage();
    
    // Clear current notes
    notesContainer.innerHTML = "";
    
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
            <small class="note-date">${new Date(note.createdAt).toLocaleDateString()}</small>
        `;
        notesContainer.appendChild(noteCard);
    });
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
