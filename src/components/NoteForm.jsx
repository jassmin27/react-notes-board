import { useState } from "react";
import { Pencil, Plus } from "lucide-react";

const STATUS_DATA = {
  saving: {
    msg: "Saving...",
    className: "saving",
  },
  saveSuccess: {
    msg: "Note saved successfully!",
    className: "success",
  },
  saveError: {
    msg: "Failed to save note.",
    className: "error",
  },
  updating: {
    msg: "Updating...",
    className: "saving",
  },
  updateSuccess: {
    msg: "Note updated successfully!",
    className: "success",
  },
  updateError: {
    msg: "Failed to update note.",
    className: "error",
  },
};

const getInitialNote = (noteToEdit) => {
  if (!noteToEdit) {
    return {
      title: "",
      content: "",
      tags: "",
    };
  }

  return {
    ...noteToEdit,
    tags: Array.isArray(noteToEdit.tags)
      ? noteToEdit.tags.join(", ")
      : (noteToEdit.tags ?? ""),
  };
};

function NoteForm(props) {
  const { noteToEdit = null, formRef } = props;

  const [formStatus, setFormStatus] = useState({
    msg: "",
    className: "",
  });

  const isEditing = noteToEdit !== null;

  return (
    <section
      ref={formRef}
      className={`add-note section-card ${
        isEditing ? "add-note--editing" : ""
      }`}
    >
      <NoteFormFields
        key={noteToEdit?.id ?? "new"}
        {...props}
        noteToEdit={noteToEdit}
        formStatus={formStatus}
        setFormStatus={setFormStatus}
      />
    </section>
  );
}

function NoteFormFields({
  onAddNote,
  onUpdateNote,
  onCancelEdit,
  noteToEdit = null,
  formStatus,
  setFormStatus,
}) {
  const [note, setNote] = useState(() => getInitialNote(noteToEdit));

  const isEditing = noteToEdit !== null;
  const isSubmitting = formStatus.className === STATUS_DATA.saving.className;

  const handleCancelEdit = () => {
    setFormStatus({
      msg: "",
      className: "",
    });

    onCancelEdit();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        setFormStatus(STATUS_DATA.updating);
        await onUpdateNote(note);
        setFormStatus(STATUS_DATA.updateSuccess);
      } else {
        setFormStatus(STATUS_DATA.saving);
        await onAddNote(note);
        setFormStatus(STATUS_DATA.saveSuccess);
        setNote({ title: "", content: "", tags: "" });
      }

      setTimeout(() => {
        setFormStatus({
          msg: "",
          className: "",
        });
      }, 2000);
    } catch (error) {
      const fallbackStatus = isEditing
        ? STATUS_DATA.updateError
        : STATUS_DATA.saveError;

      setFormStatus(
        error.message
          ? { ...fallbackStatus, msg: error.message }
          : fallbackStatus,
      );
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormStatus({ msg: "", className: "" });

    setNote((currentNote) => ({
      ...currentNote,
      [name]: value,
    }));
  };

  const getFormTitle = () => {
    const icon = isEditing ? (
      <Pencil size={16} aria-hidden="true" />
    ) : (
      <Plus size={18} aria-hidden="true" />
    );

    const title = isEditing ? "Edit Note" : "Add Note";

    return (
      <h2 className="section-title">
        <span className="section-title-icon" aria-hidden="true">
          {icon}
        </span>
        {title}
      </h2>
    );
  };

  return (
    <form className="add-note-form" onSubmit={handleSubmit}>
      {getFormTitle()}

      <div className="field-group">
        <label htmlFor="title">Title</label>
        <input
          className="input-field"
          type="text"
          id="title"
          name="title"
          value={note.title}
          onChange={handleInputChange}
          disabled={isSubmitting}
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
          disabled={isSubmitting}
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
          disabled={isSubmitting}
          autoComplete="off"
        />
      </div>

      <div className="form-footer">
        <p
          className={
            formStatus.className
              ? `form-status ${formStatus.className}`
              : "form-status"
          }
          aria-live="polite"
        >
          {formStatus.msg}
        </p>

        <div className="form-actions">
          {!isEditing ? (
            <button
              type="submit"
              className="form-action-btn add-note-btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Add Note"}
            </button>
          ) : (
            <div className="form-edit-actions">
              <button
                type="submit"
                className="form-action-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>

              <button
                type="button"
                className="form-action-btn"
                onClick={handleCancelEdit}
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </form>
  );
}

export default NoteForm;
