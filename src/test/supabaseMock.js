import { vi } from "vitest";

export const TEST_USER_ID = "test-user-id";

const TEST_SESSION = {
  user: {
    id: TEST_USER_ID,
  },
};

let notes = [];
let nextId = 1;

let failures = {
  select: null,
  insert: null,
  update: null,
  delete: null,
};

const takeFailure = (operation) => {
  const error = failures[operation];
  failures[operation] = null;
  return error;
};

const createError = (message) => ({
  message,
  name: "Error",
});

export const resetSupabaseMock = () => {
  notes = [];
  nextId = 1;

  failures = {
    select: null,
    insert: null,
    update: null,
    delete: null,
  };

  supabase.auth.getSession.mockClear();
  supabase.auth.signInAnonymously.mockClear();
  supabase.from.mockClear();
};

export const seedNotes = (seededNotes) => {
  notes = seededNotes.map((note, index) => ({
    id: note.id ?? index + 1,
    user_id: note.user_id ?? TEST_USER_ID,
    title: note.title,
    content: note.content,
    tags: note.tags ?? [],
    created_at: note.created_at ?? new Date().toISOString(),
  }));

  nextId =
    notes.length > 0
      ? Math.max(...notes.map((note) => Number(note.id))) + 1
      : 1;
};

export const getMockNotes = () => [...notes];

export const failNextSupabaseRequest = (operation, message) => {
  failures[operation] = createError(message);
};

const createSelectQuery = () => {
  let signal = null;

  const query = {
    order: vi.fn(() => query),

    abortSignal: vi.fn((nextSignal) => {
      signal = nextSignal;
      return query;
    }),

    then(resolve, reject) {
      const promise = Promise.resolve().then(() => {
        if (signal?.aborted) {
          return {
            data: null,
            error: createError("AbortError: signal is aborted without reason"),
          };
        }

        const error = takeFailure("select");

        if (error) {
          return {
            data: null,
            error,
          };
        }

        const data = [...notes].sort(
          (a, b) => new Date(b.created_at) - new Date(a.created_at),
        );

        return {
          data,
          error: null,
        };
      });

      return promise.then(resolve, reject);
    },
  };

  return query;
};

const createInsertQuery = (newNote) => {
  return {
    select: vi.fn(() => ({
      single: vi.fn(async () => {
        const error = takeFailure("insert");

        if (error) {
          return {
            data: null,
            error,
          };
        }

        const savedNote = {
          id: nextId++,
          ...newNote,
          created_at: new Date().toISOString(),
        };

        notes.push(savedNote);

        return {
          data: savedNote,
          error: null,
        };
      }),
    })),
  };
};

const createUpdateQuery = (updatedFields) => {
  let noteId = null;

  const query = {
    eq: vi.fn((column, value) => {
      if (column === "id") {
        noteId = value;
      }

      return query;
    }),

    select: vi.fn(() => ({
      single: vi.fn(async () => {
        const error = takeFailure("update");

        if (error) {
          return {
            data: null,
            error,
          };
        }

        const noteIndex = notes.findIndex((note) => note.id === noteId);

        if (noteIndex === -1) {
          return {
            data: null,
            error: createError("Note not found."),
          };
        }

        notes[noteIndex] = {
          ...notes[noteIndex],
          ...updatedFields,
        };

        return {
          data: notes[noteIndex],
          error: null,
        };
      }),
    })),
  };

  return query;
};

const createDeleteQuery = () => {
  let noteId = null;

  const query = {
    eq: vi.fn((column, value) => {
      if (column === "id") {
        noteId = value;
      }

      return query;
    }),

    then(resolve, reject) {
      const promise = Promise.resolve().then(() => {
        const error = takeFailure("delete");

        if (error) {
          return {
            data: null,
            error,
          };
        }

        notes = notes.filter((note) => note.id !== noteId);

        return {
          data: null,
          error: null,
        };
      });

      return promise.then(resolve, reject);
    },
  };

  return query;
};

export const supabase = {
  auth: {
    getSession: vi.fn(async () => ({
      data: {
        session: TEST_SESSION,
      },
      error: null,
    })),

    signInAnonymously: vi.fn(async () => ({
      data: {
        session: TEST_SESSION,
        user: TEST_SESSION.user,
      },
      error: null,
    })),
  },

  from: vi.fn((table) => {
    if (table !== "notes") {
      throw new Error(`Unexpected Supabase table: ${table}`);
    }

    return {
      select: vi.fn(() => createSelectQuery()),

      insert: vi.fn((newNote) => createInsertQuery(newNote)),

      update: vi.fn((updatedFields) => createUpdateQuery(updatedFields)),

      delete: vi.fn(() => createDeleteQuery()),
    };
  }),
};
