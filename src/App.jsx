import AppHeader from "./components/AppHeader.jsx";
import NoteForm from "./components/NoteForm.jsx";
import NotesControls from "./components/NotesControls.jsx";
import NotesList from "./components/NotesList.jsx";

import { useState, useEffect, useRef } from "react";
import { supabase } from "./lib/supabaseClient";
import "./App.css";

function parseNote(note) {
  return {
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

let sessionPromise;

const getOrCreateSession = async () => {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        return session;
      }

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        throw error;
      }

      return data.session;
    })();
  }

  try {
    return await sessionPromise;
  } catch (error) {
    sessionPromise = null;
    throw error;
  }
};

const notesFetchRequest = async (signal) => {
  let query = supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (signal) {
    query = query.abortSignal(signal);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

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

      await getOrCreateSession();

      const data = await notesFetchRequest();
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
        await getOrCreateSession();

        const data = await notesFetchRequest(controller.signal);
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

    const newNote = parseNote(note);

    try {
      const session = await getOrCreateSession();

      const { data: savedNote, error } = await supabase
        .from("notes")
        .insert({
          ...newNote,
          user_id: session.user.id,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

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

    const parsedNote = parseNote(updatedNote);

    try {
      const { data: savedNote, error } = await supabase
        .from("notes")
        .update(parsedNote)
        .eq("id", updatedNote.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

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

      const { error } = await supabase.from("notes").delete().eq("id", noteId);

      if (error) {
        throw error;
      }

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
