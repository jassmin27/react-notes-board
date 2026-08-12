import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

beforeEach(() => {
  localStorage.clear();
});

const STORAGE_KEY = "react-notes-board";

const passToSaveNoteAPI = (note) => Promise.resolve(note);

const failToSaveNoteAPI = () =>
  Promise.reject(new Error("Failed to save note."));

const renderApp = (saveNote = passToSaveNoteAPI) => {
  render(<App saveNote={saveNote} />);
  return userEvent.setup();
};

const defaultNote = {
  title: "test title",
  content: "test content",
  tags: "test tag",
};

const addNote = async (user, note = defaultNote) => {
  await user.type(screen.getByLabelText(/title/i), note.title);
  await user.type(screen.getByLabelText(/content/i), note.content);

  if (note.tags) {
    await user.type(screen.getByLabelText(/tags/i), note.tags);
  }

  await user.click(screen.getByRole("button", { name: /add note/i }));
};

describe("App initial render", () => {
  test("renders the app heading", () => {
    renderApp();

    expect(screen.getByText(/react notes board/i)).toBeInTheDocument();
  });
});

describe("Add note with tags", () => {
  test("adds a note with tags and shows it in the list", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await addNote(user);

    // Assert
    expect(await screen.findByText("test title")).toBeInTheDocument();
    expect(screen.getByText("test content")).toBeInTheDocument();

    const noteCard = screen.getByText("test title").closest("article");
    expect(noteCard).not.toBeNull();
    expect(within(noteCard).getByText("test tag")).toBeInTheDocument();
    expect(screen.getByText(/all notes/i)).toBeInTheDocument();
  });

  test("clears the form after adding a note", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await addNote(user);

    // Wait for save to complete
    await screen.findByText("test title");

    // Assert
    expect(screen.getByLabelText(/title/i)).toHaveValue("");
    expect(screen.getByLabelText(/content/i)).toHaveValue("");
    expect(screen.getByLabelText(/tags/i)).toHaveValue("");
  });

  test("shows success message after adding a note", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await addNote(user);

    // Assert
    expect(
      await screen.findByText(/note saved successfully!/i),
    ).toBeInTheDocument();
  });

  test("shows Find Notes section after adding a note", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await addNote(user);

    // Wait for save to complete
    await screen.findByText("test title");

    // Assert
    expect(screen.getByText(/find notes/i)).toBeInTheDocument();
  });

  test("shows tag filter after adding a note with tags", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await addNote(user);

    // Assert
    expect(
      await screen.findByRole("button", { name: /test tag/i }),
    ).toBeInTheDocument();
  });
});

describe("Add note without tags", () => {
  test("adds a note when tags field is empty", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await addNote(user, {
      title: "Note without tags",
      content: "This note has no tags",
      tags: "",
    });

    // Assert
    expect(await screen.findByText(/note without tags/i)).toBeInTheDocument();
    expect(screen.getByText(/this note has no tags/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(1);
  });
});

describe("Add note validation", () => {
  test("cleans tags before adding a note", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await user.type(screen.getByLabelText(/title/i), "test title");
    await user.type(screen.getByLabelText(/content/i), "test content");
    await user.type(
      screen.getByLabelText(/tags/i),
      " React, testing , , REACT, javascript, ",
    );

    await user.click(screen.getByRole("button", { name: /add note/i }));

    // Wait for note to be added
    const noteCard = (await screen.findByText("test title")).closest("article");
    expect(noteCard).not.toBeNull();

    // Assert
    const tags = noteCard.querySelectorAll(".tag");

    expect(tags).toHaveLength(3);
    expect(within(noteCard).getByText("react")).toBeInTheDocument();
    expect(within(noteCard).getByText("testing")).toBeInTheDocument();
    expect(within(noteCard).getByText("javascript")).toBeInTheDocument();
  });

  test("trims title and content before adding a note", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await user.type(screen.getByLabelText(/title/i), "  test title  ");
    await user.type(screen.getByLabelText(/content/i), "  test content  ");
    await user.click(screen.getByRole("button", { name: /add note/i }));

    // Assert
    const title = await screen.findByText("test title");
    const content = screen.getByText("test content");

    expect(title.textContent).toBe("test title");
    expect(content.textContent).toBe("test content");
  });

  test("does not add a note when title contains only spaces", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await user.type(screen.getByLabelText(/title/i), "   ");
    await user.type(screen.getByLabelText(/content/i), "test content");
    await user.click(screen.getByRole("button", { name: /add note/i }));

    // Assert
    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });

  test("does not add a note when content contains only spaces", async () => {
    // Arrange
    const user = renderApp();

    // Act
    await user.type(screen.getByLabelText(/title/i), "test title");
    await user.type(screen.getByLabelText(/content/i), "   ");
    await user.click(screen.getByRole("button", { name: /add note/i }));

    // Assert
    expect(await screen.findByText(/content is required/i)).toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });
});

describe("Add note failure", () => {
  test("shows error message if note fails to save", async () => {
    // Arrange
    const user = renderApp(failToSaveNoteAPI);

    // Act
    await addNote(user);

    // Assert
    expect(await screen.findByText(/failed to save note/i)).toBeInTheDocument();
  });
});

describe("Delete note", () => {
  test("deletes a note from the list", async () => {
    // Arrange
    const user = renderApp();
    await addNote(user);
    await screen.findByText(/test title/i);

    // Act
    const noteCard = screen.getByRole("article");
    expect(noteCard).not.toBeNull();
    await user.click(
      within(noteCard).getByRole("button", { name: /delete note/i }),
    );

    // Assert
    expect(screen.queryByText(/test title/i)).not.toBeInTheDocument();
  });

  test("hides notes UI after deleting the last note", async () => {
    // Arrange
    const user = renderApp();
    await addNote(user);
    await screen.findByText(/test title/i);

    // Act
    const noteCard = screen.getByRole("article");
    expect(noteCard).not.toBeNull();
    await user.click(
      within(noteCard).getByRole("button", { name: /delete note/i }),
    );

    // Assert
    expect(screen.queryByText(/find notes/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/all notes/i)).not.toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(0);
  });
});

describe("Search notes", () => {
  const reactNote = {
    title: "React basics",
    content: "Learning components",
    tags: "frontend",
  };

  const groceryNote = {
    title: "Grocery List",
    content: "Buy milk and bread",
    tags: "personal",
  };

  test("filters notes by title text", async () => {
    // Arrange
    const user = renderApp();
    await addNote(user, reactNote);
    await addNote(user, groceryNote);

    expect(await screen.findAllByRole("article")).toHaveLength(2);

    // Act
    await user.type(
      screen.getByPlaceholderText(/search by title or content/i),
      "react",
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryAllByRole("article")).toHaveLength(1);
    });

    expect(screen.queryByText(/grocery list/i)).not.toBeInTheDocument();
    expect(screen.getByText(/react basics/i)).toBeInTheDocument();
  });

  test("filters notes by content text", async () => {
    // Arrange
    const user = renderApp();

    await addNote(user, reactNote);
    await addNote(user, groceryNote);

    expect(await screen.findAllByRole("article")).toHaveLength(2);

    // Act
    await user.type(
      screen.getByPlaceholderText(/search by title or content/i),
      "milk",
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryAllByRole("article")).toHaveLength(1);
    });

    expect(screen.getByText(/grocery list/i)).toBeInTheDocument();
    expect(screen.getByText(/buy milk and bread/i)).toBeInTheDocument();
    expect(screen.queryByText(/react basics/i)).not.toBeInTheDocument();
  });

  test("shows no results message when search has no matches", async () => {
    // Arrange
    const user = renderApp();
    await addNote(user, reactNote);
    await addNote(user, groceryNote);

    expect(await screen.findAllByRole("article")).toHaveLength(2);

    // Act
    await user.type(
      screen.getByPlaceholderText(/search by title or content/i),
      "phone",
    );

    // Assert
    await waitFor(() => {
      expect(screen.queryAllByRole("article")).toHaveLength(0);
    });

    expect(screen.getByText(/search results/i)).toBeInTheDocument();
    expect(screen.getByText(/no notes found/i)).toBeInTheDocument();
  });

  test("shows all notes again when search input is cleared", async () => {
    // Arrange
    const user = renderApp();
    await addNote(user, reactNote);
    await addNote(user, groceryNote);

    expect(await screen.findAllByRole("article")).toHaveLength(2);

    const searchInput = screen.getByPlaceholderText(
      /search by title or content/i,
    );

    // Act
    await user.type(searchInput, "phone");

    await waitFor(() => {
      expect(screen.queryAllByRole("article")).toHaveLength(0);
    });

    await user.clear(searchInput);

    // Assert
    await waitFor(() => {
      expect(screen.queryAllByRole("article")).toHaveLength(2);
    });
  });
});

describe("Tag filters", () => {
  const workNote = {
    title: "Work task",
    content: "Finish React tests",
    tags: "work",
  };

  const personalNote = {
    title: "Shopping list",
    content: "Buy milk",
    tags: "personal",
  };

  test("filters notes by selected tag", async () => {
    // Arrange
    const user = renderApp();
    await addNote(user, workNote);
    await addNote(user, personalNote);

    expect(await screen.findAllByRole("article")).toHaveLength(2);

    // Act
    await user.click(screen.getByRole("button", { name: /work/i }));

    // Assert
    expect(await screen.findAllByRole("article")).toHaveLength(1);
    expect(screen.getByText(/work task/i)).toBeInTheDocument();
    expect(screen.queryByText(/shopping list/i)).not.toBeInTheDocument();
  });

  test("resets to All tag when the selected tag has no notes left", async () => {
    // Arrange
    const user = renderApp();
    await addNote(user, workNote);
    await addNote(user, personalNote);

    expect(await screen.findAllByRole("article")).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: /work/i }));

    const noteCard = screen.getByText(/work task/i).closest("article");
    expect(noteCard).not.toBeNull();

    // Act
    await user.click(
      within(noteCard).getByRole("button", { name: /delete note/i }),
    );

    // Assert
    expect(screen.getByRole("button", { name: /all/i })).toHaveClass("active");
    expect(screen.getByText(/shopping list/i)).toBeInTheDocument();
    expect(screen.queryByText(/work task/i)).not.toBeInTheDocument();
    expect(screen.queryAllByRole("article")).toHaveLength(1);
  });
});

describe("localStorage persistence", () => {
  test("loads notes from localStorage", () => {
    // Arrange
    const savedNotes = [
      {
        id: "1",
        title: "Saved note",
        content: "Loaded from storage",
        tags: ["storage"],
        createdAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(savedNotes));

    // Act
    renderApp();

    // Assert
    expect(screen.getByText(/saved note/i)).toBeInTheDocument();
    expect(screen.getByText(/loaded from storage/i)).toBeInTheDocument();
  });

  test("saves notes to localStorage when a note is added", async () => {
    // Arrange
    const user = renderApp();

    let savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(savedNotes).toHaveLength(0);

    // Act
    await addNote(user, {
      title: "Local note",
      content: "Saved to localStorage",
      tags: "storage",
    });

    await screen.findByText(/local note/i);

    // Assert
    savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(savedNotes).toHaveLength(1);
    expect(savedNotes[0]).toMatchObject({
      title: "Local note",
      content: "Saved to localStorage",
      tags: ["storage"],
    });
  });

  test("removes deleted notes from localStorage", async () => {
    // Arrange
    const user = renderApp();

    await addNote(user, {
      title: "Delete from storage",
      content: "This should be removed",
      tags: "storage",
    });

    await screen.findByText(/delete from storage/i);

    let savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(savedNotes).toHaveLength(1);

    const noteCard = screen
      .getByText(/delete from storage/i)
      .closest("article");

    expect(noteCard).not.toBeNull();

    // Act
    await user.click(
      within(noteCard).getByRole("button", { name: /delete note/i }),
    );

    // Assert
    savedNotes = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
    expect(savedNotes).toHaveLength(0);
  });
});
