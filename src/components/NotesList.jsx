import NoteCard from "./NoteCard.jsx";
import { NotepadText } from "lucide-react";

function NotesList(props) {
  const { notes, isSearching, onDelete } = props;
  const notesTitle = isSearching ? "Search Results" : "All Notes";

  return (
    <section className="notes-section section-card">
      <div className="section-title">
        <span className="section-title-icon">
          <NotepadText size={17} aria-hidden="true" />
        </span>
        {notesTitle}
      </div>
      {notes.length === 0 && (
        <p className="no-notes-found-msg">No notes found.</p>
      )}
      <div className="note-cards">
        {notes.map((note) => (
          <NoteCard key={note.id} note={note} onDelete={onDelete} />
        ))}
      </div>
    </section>
  );
}

export default NotesList;
