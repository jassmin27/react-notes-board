import { Pencil, Trash2 } from "lucide-react";

function NoteCard(props) {
  const { note, onEdit, onDelete } = props;
  return (
    <article className="note-card section-card">
      <header>
        <h3>{note.title}</h3>
        <div className="note-actions">
          <button
            type="button"
            className="note-action-btn note-action-btn--edit"
            aria-label="Edit note"
            onClick={() => onEdit(note)}
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="note-action-btn note-action-btn--delete"
            aria-label="Delete note"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </header>
      <div className="content">
        <p>{note.content}</p>
      </div>
      <footer>
        <div className="tags">
          {note.tags.map((tag) => (
            <span className="tag" key={tag}>
              {tag}
            </span>
          ))}
        </div>
      </footer>
    </article>
  );
}

export default NoteCard;
