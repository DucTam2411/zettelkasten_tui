import React, { useEffect, useState } from "react";
import { Box, Text, useInput } from "ink";
import { loadNote, saveNote } from "@/storage/note.js";
import { colors } from "@/theme.js";
import dayjs from "@/lib/dayjs.js";
import { KawaiiCat } from "@/components/RandomArtImage.js";

type EditorProps = {
  id: string;
  onBack: () => void;
};

const BLINK_INTERVAL = 500;

function isBackspace(input: string, key: any) {
  return (
    key.delete ||
    key.backspace ||
    input === "\u007f" ||
    input === "\b"
  );
}

const Editor: React.FC<EditorProps> = ({ id, onBack }) => {
  const [mode, setMode] = useState<"title" | "content">("title");

  const [title, setTitle] = useState("Untitled");
  const [content, setContent] = useState("");

  const [cursor, setCursor] = useState(0);
  const cursorVisible = true

  const [dirty, setDirty] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<number>(Date.now());
  const [saveCounter, setSaveCouter] = useState(0)


  /* ---------------- Note loading ---------------- */

  useEffect(() => {
    const note = loadNote(id);

    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setUpdatedAt(note.updatedAt);
      setDirty(false);
      setCursor(note.content.length - 1);
    } else {
      // New note
      setTitle("Untitled");
      setContent("");
      setUpdatedAt(Date.now());
      setDirty(false);
      setCursor(0);
    }
  }, [id]);


  /* ---------------- Cursor blinking ---------------- */

  // useEffect(() => {
  //   const timer = setInterval(() => {
  //     setCursorVisible(v => !v);
  //   }, BLINK_INTERVAL);
  //   return () => clearInterval(timer);
  // }, []);

  /* ---------------- Input handling ---------------- */

  useInput((input, key) => {
    if (key.escape) {
      onBack();
      return;
    }

    if (key.ctrl && input === "s") {
      const now = Date.now();

      saveNote({
        id,
        title,
        content,
        updatedAt: now,
      });

      setUpdatedAt(now);
      setDirty(false);
      setSaveCouter(c => c + 1);
      return;
    }

    /* ---------- TITLE MODE ---------- */
    if (mode === "title") {
      if (key.return) {
        setMode("content");
        if (content?.length) {
          setCursor(content.length - 1);
        }
        else {
          setCursor(0);

        }
        return;
      }

      if (isBackspace(input, key)) {
        if (title.length > 0) {
          setTitle(t => t.slice(0, -1));
          setDirty(true);
        }
        return;
      }

      if (!key.ctrl && !key.meta && input) {
        setTitle(t => t + input);
        setDirty(true);
      }

      return;
    }

    /* ---------- CONTENT MODE ---------- */

    if (key.leftArrow) {
      setCursor(c => Math.max(0, c - 1));
      return;
    }

    if (key.rightArrow) {
      setCursor(c => Math.min(content.length, c + 1));
      return;
    }

    if (!key.ctrl && !key.meta) {
      if (key.return) {
        setContent(c => c.slice(0, cursor) + "\n" + c.slice(cursor));
        setCursor(c => c + 1);
        setDirty(true);
      } else if (isBackspace(input, key)) {
        if (cursor > 0) {
          setContent(c => c.slice(0, cursor - 1) + c.slice(cursor));
          setCursor(c => c - 1);
          setDirty(true);
        }
      } else if (input) {
        setContent(c => c.slice(0, cursor) + input + c.slice(cursor));
        setCursor(c => c + input.length);
        setDirty(true);
      }
    }
  });

  /* ---------------- Render ---------------- */

  return (
    <Box flexDirection="row" width="100%"
      justifyContent="flex-end" alignItems="flex-start">
      <Box flexDirection="column" flexGrow={1}>
        {/* Title */}
        <Text color={colors.primary} bold>
          {mode === "title" ? (
            <>
              {title || " "}
              {cursorVisible && (
                <Text backgroundColor={colors.primary} color="black">
                  {" "}
                </Text>
              )}
            </>
          ) : (
            title
          )}


        </Text>

        {/* Status */}


        <Text dimColor>
          {dirty
            ? "Modified"
            : `Saved ${dayjs(updatedAt).fromNow()}`}
        </Text>



        {/* Body */}
        <Box marginTop={1} flexDirection="column">
          <EditorView
            content={content}
            cursor={cursor}
            cursorVisible={mode === "title" ? false : cursorVisible}
          />
        </Box>


      </Box>


      {/* Right: cat */}
      <Box
        width={10}
        alignItems="flex-end"
        justifyContent="center"
      >
        <KawaiiCat
          noteId={id}
          mood={dirty ? "editing" : "idle"}
          saveTick={saveCounter}
        />
      </Box>

    </Box>
  );
};

export default Editor;

/* ---------------- Body View ---------------- */

function EditorView({
  content,
  cursor,
  cursorVisible,
}: {
  content: string;
  cursor: number;
  cursorVisible: boolean;
}) {
  const lines = content.split("\n");
  let charIndex = 0;

  return (
    <>
      {lines.map((line, i) => {
        const start = charIndex;
        const end = charIndex + line.length;
        charIndex = end + 1;

        const inLine = cursor >= start && cursor <= end;

        if (!inLine) return <Text key={i}>{line}</Text>;

        const pos = cursor - start;
        const before = line.slice(0, pos);
        const char = line[pos] ?? " ";
        const after = line.slice(pos + 1);

        return (
          <Text key={i}>
            {before}
            {cursorVisible ? (
              <Text backgroundColor={colors.primary} color="black">
                {char}
              </Text>
            ) : (
              <Text>{char}</Text>
            )}
            {after}
          </Text>
        );
      })}



    </>
  );
}

