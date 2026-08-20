function SearchBox(props) {
  const { searchText, onSearchChange } = props;
  return (
    <div className="search-notes">
      <div className="field-group">
        <input
          className="input-field"
          type="text"
          id="search-notes-text"
          aria-label="Search notes"
          placeholder="Search by title or content..."
          value={searchText}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
    </div>
  );
}

export default SearchBox;
