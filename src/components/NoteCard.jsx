function NoteCard(props) {
  const { note, onDelete } = props;
  return (
    <article className="note-card section-card">
      <header>
        <h3>{note.title}</h3>
        <button
          type="button"
          className="delete-note-btn"
          aria-label="Delete note"
          onClick={() => onDelete(note.id)}
        >
          <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16">
            <line
              x1="6"
              y1="6"
              x2="18"
              y2="18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <line
              x1="6"
              y1="18"
              x2="18"
              y2="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
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
