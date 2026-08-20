import SearchBox from "./SearchBox";
import TagFilters from "./TagFilters";
import { Search } from "lucide-react";

function NotesControls(props) {
  const {
    searchText,
    onSearchChange,
    tagsSummary,
    totalNotes,
    onActiveTagChange,
    activeTag,
  } = props;
  return (
    <section className="notes-controls section-card">
      <h2 className="section-title">
        <span className="section-title-icon" aria-hidden="true">
          <Search size={17} aria-hidden="true" />
        </span>
        Find Notes
      </h2>
      <SearchBox searchText={searchText} onSearchChange={onSearchChange} />
      <TagFilters
        tagsSummary={tagsSummary}
        totalNotes={totalNotes}
        onActiveTagChange={onActiveTagChange}
        activeTag={activeTag}
      />
    </section>
  );
}

export default NotesControls;
