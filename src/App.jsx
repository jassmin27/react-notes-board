import AppHeader from "./components/AppHeader.jsx";
import NoteForm from "./components/NoteForm.jsx";
import NotesControls from "./components/NotesControls.jsx";
import NotesList from "./components/NotesList.jsx";

import { useState, useEffect, useRef } from "react";
import "./App.css";

const STORAGE_KEY = "react-notes-board";

function loadNotesFromStorage() {
  const savedNotes = localStorage.getItem(STORAGE_KEY);

  if (!savedNotes) return [];

  try {
    const parsedNotes = JSON.parse(savedNotes);
    return Array.isArray(parsedNotes) ? parsedNotes : [];
  } catch (error) {
    console.error("Failed to parse notes from localStorage:", error);
    return [];
  }
}

function parseNote(note) {
  return {
    ...note,
    title: note.title.trim(),
    content: note.content.trim(),
    tags: parseTags(note.tags),
  };
}

function parseTags(tagsText) {
  const cleanedTags = tagsText
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(cleanedTags)];
}

function createNote(note) {
  return {
    ...parseNote(note),
    id: Date.now().toString(),
  };
}

function getTagsSummary(notes) {
  const tagsSummary = notes.reduce((acc, note) => {
    for (const tag of note.tags) {
      const existingTag = acc.find((tagObject) => tagObject.name === tag);

      if (existingTag) {
        existingTag.count += 1;
      } else {
        acc.push({ name: tag, count: 1 });
      }
    }

    return acc;
  }, []);

  return tagsSummary.sort((a, b) => a.name.localeCompare(b.name));
}

function getVisibleNotes(notes, debouncedSearchText, activeTag) {
  const normalizedSearchText = debouncedSearchText.trim().toLowerCase();

  let visibleNotes = normalizedSearchText
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(normalizedSearchText) ||
          note.content.toLowerCase().includes(normalizedSearchText),
      )
    : notes;

  if (activeTag) {
    visibleNotes = visibleNotes.filter((note) => note.tags.includes(activeTag));
  }

  return visibleNotes;
}

const fakeAPI = {
  saveNote(note) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const serverIsUp = Math.random() >= 0.2;
        if (serverIsUp) {
          resolve(note);
        } else {
          reject(
            new Error("Failed to connect to the database. Please try again."),
          );
        }
      }, 1500);
    });
  },

  updateNote(note) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const serverIsUp = Math.random() >= 0.2;
        if (serverIsUp) {
          resolve(note);
        } else {
          reject(new Error("Failed to update note. Please try again."));
        }
      }, 1500);
    });
  },
};

function App({ saveNote = fakeAPI.saveNote, updateNote = fakeAPI.updateNote }) {
  const [notes, setNotes] = useState(loadNotesFromStorage);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [noteToEdit, setNoteToEdit] = useState(null);
  const formRef = useRef(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedSearchText(searchText.trim()),
      300,
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  const handleDeleteNote = (noteId) => {
    const updatedNotes = notes.filter((note) => note.id !== noteId);

    setNotes(updatedNotes);

    if (noteToEdit?.id === noteId) {
      setNoteToEdit(null);
    }

    if (updatedNotes.length === 0) {
      setSearchText("");
      setDebouncedSearchText("");
      setActiveTag("");
      return;
    }

    if (activeTag) {
      const noteWithActiveTagExists = updatedNotes.some((note) =>
        note.tags.includes(activeTag),
      );

      if (!noteWithActiveTagExists) {
        setActiveTag("");
      }
    }
  };

  const handleEditNote = (note) => {
    setNoteToEdit(note);

    formRef.current?.scrollIntoView?.({
      behavior: "smooth",
      block: "start",
    });
  };

  const validateNoteTitleAndContent = (note) => {
    if (!note.title.trim()) {
      throw new Error("Title is required.");
    }

    if (!note.content.trim()) {
      throw new Error("Content is required.");
    }
  };

  const handleAddNote = async (note) => {
    validateNoteTitleAndContent(note);
    const newNote = createNote(note);
    const savedNote = await saveNote(newNote);
    setNotes((previousNotes) => [...previousNotes, savedNote]);
  };

  const handleUpdateNote = async (updatedNote) => {
    validateNoteTitleAndContent(updatedNote);
    const parsedNote = parseNote(updatedNote);
    const savedNote = await updateNote(parsedNote);

    setNotes((currentNotes) =>
      currentNotes.map((note) =>
        note.id === savedNote.id
          ? {
              ...note,
              ...savedNote,
            }
          : note,
      ),
    );

    setNoteToEdit(null);
  };

  const handleCancelEdit = () => {
    setNoteToEdit(null);
  };

  const visibleNotes = getVisibleNotes(notes, debouncedSearchText, activeTag);

  const tagsSummary = getTagsSummary(notes);

  return (
    <main className="container">
      <AppHeader />
      <NoteForm
        formRef={formRef}
        noteToEdit={noteToEdit}
        onAddNote={handleAddNote}
        onUpdateNote={handleUpdateNote}
        onCancelEdit={handleCancelEdit}
      />
      {notes.length > 0 && (
        <>
          <NotesControls
            searchText={searchText}
            onSearchChange={setSearchText}
            tagsSummary={tagsSummary}
            totalNotes={notes.length}
            activeTag={activeTag}
            onActiveTagChange={setActiveTag}
          />

          <NotesList
            notes={visibleNotes}
            isSearching={debouncedSearchText.length > 0}
            onDelete={handleDeleteNote}
            onEdit={handleEditNote}
          />
        </>
      )}
    </main>
  );
}

export default App;
