import { NotebookPen } from "lucide-react";

function AppHeader() {
  return (
    <header className="app-heading">
      <div className="app-heading-icon">
        <NotebookPen size={38} />
      </div>
      <div className="app-heading-text">
        <h1>React Notes Board</h1>
        <p>Create, search, and filter your notes with tags</p>
      </div>
    </header>
  );
}

export default AppHeader;
