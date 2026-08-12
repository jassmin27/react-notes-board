function TagFilters(props) {
  const { tagsSummary, totalNotes, onActiveTagChange, activeTag } = props;
  return (
    <div className="filter-notes">
      <h3 className="filters-label">Filter by tag</h3>
      <div className="filter-pills">
        <button
          type="button"
          onClick={() => onActiveTagChange("")}
          className={activeTag === "" ? "filter-pill active" : "filter-pill"}
        >
          All ({totalNotes})
        </button>
        {tagsSummary.map((tag) => (
          <button
            key={tag.name}
            type="button"
            onClick={() => onActiveTagChange(tag.name)}
            className={
              activeTag === tag.name ? "filter-pill active" : "filter-pill"
            }
          >
            {tag.name} ({tag.count})
          </button>
        ))}
      </div>
    </div>
  );
}

export default TagFilters;
