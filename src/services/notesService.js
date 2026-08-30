import { supabase } from "../lib/supabaseClient";

let sessionPromise;

const getOrCreateSession = async () => {
  if (!sessionPromise) {
    sessionPromise = (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session) {
        return session;
      }

      const { data, error } = await supabase.auth.signInAnonymously();

      if (error) {
        throw error;
      }

      return data.session;
    })();
  }

  try {
    return await sessionPromise;
  } catch (error) {
    sessionPromise = null;
    throw error;
  }
};

export const fetchNotes = async (signal) => {
  await getOrCreateSession();

  let query = supabase
    .from("notes")
    .select("*")
    .order("created_at", { ascending: false });

  if (signal) {
    query = query.abortSignal(signal);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};

export const createNote = async (note) => {
  const session = await getOrCreateSession();

  const { data, error } = await supabase
    .from("notes")
    .insert({
      ...note,
      user_id: session.user.id,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const updateNote = async (noteId, note) => {
  const { data, error } = await supabase
    .from("notes")
    .update(note)
    .eq("id", noteId)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
};

export const deleteNote = async (noteId) => {
  const { error } = await supabase.from("notes").delete().eq("id", noteId);

  if (error) {
    throw error;
  }
};
