import { useState } from "react";
import { Plus } from "lucide-react";

const STATUS_DATA = {
  saving: {
    msg: "Saving...",
    className: "saving",
  },
  success: {
    msg: "Note saved successfully!",
    className: "success",
  },
  error: {
    msg: "Failed to save note.",
    className: "error",
  },
};

function NoteForm(props) {
  const { onAddNote } = props;
  const [note, setNote] = useState({
    title: "",
    content: "",
    tags: "",
  });
  const [addNoteStatus, setAddNoteStatus] = useState({
    msg: "",
    className: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setAddNoteStatus(STATUS_DATA.saving);
      await onAddNote(note);

      setNote({ title: "", content: "", tags: "" });
      setAddNoteStatus(STATUS_DATA.success);

      setTimeout(
        () =>
          setAddNoteStatus({
            msg: "",
            className: "",
          }),
        2000,
      );
    } catch (error) {
      setAddNoteStatus(
        error.message
          ? { ...STATUS_DATA.error, msg: error.message }
          : STATUS_DATA.error,
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setAddNoteStatus({ msg: "", className: "" });

    setNote((currentNote) => ({
      ...currentNote,
      [name]: value,
    }));
  };

  const isSaving = addNoteStatus.className === STATUS_DATA.saving.className;

  return (
    <section className="add-note section-card">
      <div className="section-title">
        <span className="section-title-icon">
          <Plus size={18} aria-hidden="true" />
        </span>
        Add Note
      </div>
      <form className="add-note-form" onSubmit={handleSubmit}>
        <div className="field-group">
          <label htmlFor="title">Title</label>
          <input
            className="input-field"
            type="text"
            id="title"
            name="title"
            value={note.title}
            onChange={handleInputChange}
            disabled={isSaving}
            required
          />
        </div>
        <div className="field-group">
          <label htmlFor="content">Content</label>
          <textarea
            className="input-field"
            id="content"
            rows="4"
            name="content"
            value={note.content}
            onChange={handleInputChange}
            disabled={isSaving}
            required
          ></textarea>
        </div>
        <div className="field-group">
          <label htmlFor="tags">Tags</label>
          <input
            className="input-field"
            type="text"
            id="tags"
            name="tags"
            placeholder="e.g. work, ideas"
            value={note.tags}
            onChange={handleInputChange}
            disabled={isSaving}
            autoComplete="off"
          />
        </div>
        <div className="add-note-action">
          <p
            className={
              addNoteStatus.className
                ? `add-note-status ${addNoteStatus.className}`
                : "add-note-status"
            }
          >
            {addNoteStatus.msg}
          </p>
          <button type="submit" className="add-note-btn" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Note"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default NoteForm;
