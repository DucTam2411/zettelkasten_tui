import fs from "fs";
import path from "path";
import matter from "gray-matter";

/* -------------------------------------------------- */
/* ---------------- Configuration ------------------- */
/* -------------------------------------------------- */

const NOTES_DIR = path.join(process.cwd(), "zettel");

/* -------------------------------------------------- */
/* -------------------- Types ----------------------- */
/* -------------------------------------------------- */

export type NoteData = {
  id: string;
  title: string;
  updatedAt: number;
  content: string;
};

export type NoteMeta = {
  id: string;
  title: string;
  updatedAt: number;
};

/* -------------------------------------------------- */
/* ------------------- Helpers ---------------------- */
/* -------------------------------------------------- */

function ensureNotesDir() {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
}

function notePath(id: string) {
  return path.join(NOTES_DIR, `${id}.md`);
}

/* -------------------------------------------------- */
/* -------------------- API ------------------------- */
/* -------------------------------------------------- */

/**
 * Load a single note by id.
 * Returns null if the file does not exist.
 */
export function loadNote(id: string): NoteData | null {
  ensureNotesDir();
  const filePath = notePath(id);

  if (!fs.existsSync(filePath)) {
    return null;
  }

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);

  return {
    id,
    title: parsed.data.title ?? "Untitled",
    updatedAt: parsed.data.updatedAt
      ? new Date(parsed.data.updatedAt).getTime()
      : Date.now(),
    content: parsed.content.trimStart(),
  };
}

/**
 * Save (create or overwrite) a note.
 */
export function saveNote(note: NoteData) {
  ensureNotesDir();

  const file = matter.stringify(note.content, {
    id: note.id,
    title: note.title,
    updatedAt: new Date(note.updatedAt).toISOString(),
  });

  fs.writeFileSync(notePath(note.id), file, "utf8");
}

/**
 * List metadata for all notes (for List screen).
 */
export function listNotes(): NoteMeta[] {
  ensureNotesDir();

  const files = fs.readdirSync(NOTES_DIR);

  return files
    .filter(f => f.endsWith(".md"))
    .map(file => {
      const id = file.replace(/\.md$/, "");
      const raw = fs.readFileSync(notePath(id), "utf8");
      const parsed = matter(raw);

      return {
        id,
        title: parsed.data.title ?? "Untitled",
        updatedAt: parsed.data.updatedAt
          ? new Date(parsed.data.updatedAt).getTime()
          : 0,
      };
    })
    .sort((a, b) => b.updatedAt - a.updatedAt);
}


export function deleteNote(id: string) {
  const filePath = notePath(id);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

