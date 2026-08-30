import AppHeader from "./components/AppHeader.jsx";
import NoteForm from "./components/NoteForm.jsx";
import NotesControls from "./components/NotesControls.jsx";
import NotesList from "./components/NotesList.jsx";

import { useState, useEffect, useRef } from "react";
import {
  parseNote,
  validateNoteTitleAndContent,
  getTagsSummary,
  getVisibleNotes,
} from "./utils/notesUtils.js";
import {
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
} from "./services/notesService.js";
import "./App.css";

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({
    msg: "",
    className: "",
  });
  const [notes, setNotes] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [noteToEdit, setNoteToEdit] = useState(null);
  const editButtonRef = useRef(null);

  const handleRetry = async () => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const data = await fetchNotes();
      setNotes(data);
    } catch (error) {
      console.error(error);
      setLoadError("Failed to load notes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();

    const setupApp = async () => {
      try {
        const data = await fetchNotes(controller.signal);
        setNotes(data);
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error(error);
          setLoadError("Failed to load notes.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    setupApp();

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setDebouncedSearchText(searchText.trim()),
      300,
    );

    return () => {
      clearTimeout(timeoutId);
    };
  }, [searchText]);

  useEffect(() => {
    if (!deleteStatus.msg) return;

    const timeoutId = setTimeout(() => {
      setDeleteStatus({
        msg: "",
        className: "",
      });
    }, 3000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [deleteStatus]);

  const handleAddNote = async (note) => {
    validateNoteTitleAndContent(note);

    try {
      const savedNote = await createNote(parseNote(note));
      setNotes((previousNotes) => [savedNote, ...previousNotes]);
    } catch (error) {
      console.error(error);
      throw new Error("Failed to save note.", {
        cause: error,
      });
    }
  };

  const handleEditNote = (note, editButton) => {
    editButtonRef.current = editButton;
    setNoteToEdit(note);
  };

  const handleUpdateNote = async (updatedNote) => {
    validateNoteTitleAndContent(updatedNote);

    try {
      const savedNote = await updateNote(
        updatedNote.id,
        parseNote(updatedNote),
      );

      setNotes((currentNotes) =>
        currentNotes.map((note) =>
          note.id === savedNote.id ? savedNote : note,
        ),
      );

      setNoteToEdit(null);
      editButtonRef.current?.focus();
    } catch (error) {
      console.error(error);
      throw new Error("Failed to update note.", { cause: error });
    }
  };

  const handleCancelEdit = () => {
    setNoteToEdit(null);
    editButtonRef.current?.focus();
  };

  const handleDeleteNote = async (noteId) => {
    try {
      setDeleteStatus({
        msg: "",
        className: "",
      });

      await deleteNote(noteId);

      const updatedNotes = notes.filter((note) => note.id !== noteId);

      setNotes(updatedNotes);

      setDeleteStatus({
        msg: "Note deleted successfully!",
        className: "success",
      });

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
    } catch (error) {
      console.error(error);

      setDeleteStatus({
        msg: "Failed to delete note.",
        className: "error",
      });
    }
  };

  const visibleNotes = getVisibleNotes(notes, debouncedSearchText, activeTag);

  const tagsSummary = getTagsSummary(notes);

  return (
    <div className="container">
      <AppHeader />

      <main>
        <NoteForm
          noteToEdit={noteToEdit}
          onAddNote={handleAddNote}
          onUpdateNote={handleUpdateNote}
          onCancelEdit={handleCancelEdit}
        />

        {isLoading && <p>Loading notes...</p>}

        {loadError && (
          <div className="notes-error">
            <p>{loadError}</p>
            <button type="button" onClick={handleRetry}>
              Retry
            </button>
          </div>
        )}

        {!isLoading && !loadError && notes.length > 0 && (
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

        {deleteStatus.msg && (
          <div
            className={`delete-status ${deleteStatus.className}`}
            role={deleteStatus.className === "error" ? "alert" : "status"}
          >
            {deleteStatus.msg}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
