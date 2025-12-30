import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import dayjs from "@/lib/dayjs.js";
import { colors } from "@/theme.js";
import { listNotes, deleteNote } from "@/storage/note.js";
import Heatmap from "@/components/Heatmap.js";

type NoteMeta = {
  id: string;
  title: string;
  updatedAt: number;
};

type ListProps = {
  onOpen: (id: string) => void;
};

/* ---------------- Helpers ---------------- */

function generateNoteId() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
    String(now.getHours()).padStart(2, "0"),
    String(now.getMinutes()).padStart(2, "0"),
  ].join("");
}

const ID_WIDTH = 14;
const TITLE_WIDTH = 70;
const TIME_WIDTH = 14;

/* ---------------- Component ---------------- */

const List: React.FC<ListProps> = ({ onOpen }) => {
  const [notes, setNotes] = useState<NoteMeta[]>([]);
  const [selected, setSelected] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);

  /* ---------------- Load notes ---------------- */

  useEffect(() => {
    setNotes(listNotes());
  }, []);

  /* ---------------- Input ---------------- */

  useInput((input, key) => {
    /* Quit */
    if (input === "q") {
      process.exit(0);
    }

    /* Toggle heatmap */
    if (input === "h") {
      setShowHeatmap(v => !v);
      return;
    }

    if (showHeatmap && key.escape) {
      setShowHeatmap(false);
      return;
    }

    /* Delete confirm mode */
    if (confirmDelete) {
      if (input === "y" && notes[selected]) {
        deleteNote(notes[selected].id);
        const next = listNotes();
        setNotes(next);
        setSelected(i => Math.max(0, Math.min(i, next.length - 1)));
        setConfirmDelete(false);
      }

      if (input === "n" || key.escape) {
        setConfirmDelete(false);
      }

      return;
    }

    /* Navigation */
    if (key.downArrow || input === "j") {
      setSelected(i => Math.min(notes.length - 1, i + 1));
      return;
    }

    if (key.upArrow || input === "k") {
      setSelected(i => Math.max(0, i - 1));
      return;
    }

    if (input === "g") {
      setSelected(0);
      return;
    }

    if (input === "G") {
      setSelected(notes.length - 1);
      return;
    }

    /* New note */
    if (input === "n") {
      onOpen(generateNoteId());
      return;
    }

    /* Delete */
    if (input === "d" && notes[selected]) {
      setConfirmDelete(true);
      return;
    }

    /* Open */
    if (key.return && notes[selected]) {
      onOpen(notes[selected].id);
    }
  });

  /* ---------------- Render ---------------- */

  if (notes.length === 0) {
    return (
      <Box flexDirection="column">
        <Text color={colors.primary} bold>
          Zettelkasten
        </Text>
        <Text dimColor>Press n to create your first note.</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      {/* Heatmap panel */}
      {showHeatmap && (
        <Box
          borderStyle="round"
          borderColor={colors.primary}
          paddingX={1}
          marginBottom={1}
        >
          <Heatmap notes={notes} />
        </Box>
      )}

      {/* Header */}
      <Box marginBottom={1}>
        <Text color={colors.primary} bold>
          {"ID".padEnd(ID_WIDTH)}{" "}
          {" TITLE".padEnd(TITLE_WIDTH)}{" "}
          {" UPDATED".padEnd(TIME_WIDTH)}
        </Text>
      </Box>

      {/* Rows */}
      {notes.map((note, index) => {
        const isActive = index === selected;

        return (
          <Box key={note.id}>
            <Text>
              {/* Marker */}
              <Text color={isActive ? "red" : undefined} bold={isActive}>
                {isActive ? "› " : "  "}
              </Text>



              {/* ID */}
              <Text color={isActive ? colors.primary : undefined} dimColor={!isActive}>
                {note.id.padEnd(ID_WIDTH)}
              </Text>{" "}

              {/* Title */}
              <Text>
                {note.title.padEnd(TITLE_WIDTH)}
              </Text>{" "}

              {/* Time */}
              <Text dimColor>
                {dayjs(note.updatedAt).fromNow().padEnd(TIME_WIDTH)}
              </Text>
            </Text>
          </Box>
        );
      })}

      {/* Delete confirmation */}
      {confirmDelete && (
        <Box marginTop={1}>
          <Text color="red">
            Delete "{notes[selected]?.title}"? (y/n)
          </Text>
        </Box>
      )}

      {/* Footer */}
      <Box marginTop={1}>
        <Text dimColor>
          j/k or ↑/↓ navigate · Enter open · n new · d delete · h heatmap · q quit
        </Text>
      </Box>
    </Box>
  );
};

export default List;

