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
            aria-label={`Edit ${note.title}`}
            onClick={(e) => onEdit(note, e.currentTarget)}
          >
            <Pencil size={16} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="note-action-btn note-action-btn--delete"
            aria-label={`Delete ${note.title}`}
            onClick={() => onDelete(note.id)}
          >
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </header>
      <p className="content">{note.content}</p>
      <footer>
        <ul className="tags">
          {note.tags.map((tag) => (
            <li className="tag" key={tag}>
              {tag}
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}

export default NoteCard;
