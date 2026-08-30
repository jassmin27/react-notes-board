function parseTags(tagsText) {
  const cleanedTags = tagsText
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);

  return [...new Set(cleanedTags)];
}

export function parseNote(note) {
  return {
    title: note.title.trim(),
    content: note.content.trim(),
    tags: parseTags(note.tags),
  };
}

export function validateNoteTitleAndContent(note) {
  if (!note.title.trim()) {
    throw new Error("Title is required.");
  }

  if (!note.content.trim()) {
    throw new Error("Content is required.");
  }
}

export function getTagsSummary(notes) {
  const tagsSummary = notes.reduce((acc, note) => {
    for (const tag of note.tags) {
      const existingTag = acc.find((tagObject) => tagObject.name === tag);

      if (existingTag) {
        existingTag.count += 1;
      } else {
        acc.push({ name: tag, count: 1 });
      }
    }

    return acc;
  }, []);

  return tagsSummary.sort((a, b) => a.name.localeCompare(b.name));
}

export function getVisibleNotes(notes, debouncedSearchText, activeTag) {
  const normalizedSearchText = debouncedSearchText.trim().toLowerCase();

  let visibleNotes = normalizedSearchText
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(normalizedSearchText) ||
          note.content.toLowerCase().includes(normalizedSearchText),
      )
    : notes;

  if (activeTag) {
    visibleNotes = visibleNotes.filter((note) => note.tags.includes(activeTag));
  }

  return visibleNotes;
}
