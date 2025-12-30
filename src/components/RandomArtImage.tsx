import React, { memo, useEffect, useMemo, useState } from "react";
import { Box, Text } from "ink";
import { colors } from "@/theme.js";

/* --------------------------------------------------
 * Strictly CAT-like faces (no human emotion)
 * -------------------------------------------------- */

const IDLE_CATS = [
  "(=^･ω･^=)",
  "(=^･ｪ･^=)",
  "(=^._.^=)",
  "(=^‥^=)",
  "(ฅ^._.^ฅ)",
  "(ฅ･ω･ฅ)",
  "(ฅ･ｪ･ฅ)",
  "(ฅ^･ﻌ･^ฅ)",
  "(=^･ﻌ･^=)",
  "(=^･ω･^=)",
];

const EDITING_CATS = [
  "(ฅ`･ω･´ฅ)",
  "(ฅ•̀ﻌ•́ฅ)",
  "(ฅ`･ﻌ･´ฅ)",
  "(ฅ•̀ω•́ฅ)",
  "(ฅ•̀⤙•́ฅ)",
  "(ฅ•̀︿•́ฅ)",
  "(ฅ•̀ﾛ•́ฅ)",
  "(=｀ω´=)",
  "(ฅ•̀_•́ฅ)",
  "(ฅ`･_･´ฅ)",
];

const SAVING_CATS = [
  "(ฅ˘ω˘ฅ)",
  "(=^ω^=)",
  "(ฅ^ω^ฅ)",
  "(=^･ω･^=)",
  "(ฅ･ω･ฅ)",
  "(=^._.^=)",
  "(ฅ˘ﻌ˘ฅ)",
  "(=^･ﻌ･^=)",
  "(ฅ^._.^ฅ)",
  "(=^‿‿^=)",
];

/* --------------------------------------------------
 * Minimal, non-emotive text
 * -------------------------------------------------- */

const IDLE_TEXT = ["idle", "watching", "still"];
const EDITING_TEXT = ["writing", "focused", "working", "typing"];
const SAVING_TEXT = ["saved", "stored", "done", "ok"];

/* --------------------------------------------------
 * Utilities
 * -------------------------------------------------- */

function hashString(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h << 5) - h + input.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/* --------------------------------------------------
 * Props
 * -------------------------------------------------- */

export type CatMood = "idle" | "editing" | "saving";

type Props = {
  noteId: string;
  mood: CatMood;
  saveTick?: number;
};

/* --------------------------------------------------
 * Component
 * -------------------------------------------------- */

function KawaiiCatInner({ noteId, mood, saveTick = 0 }: Props) {
  const seed = useMemo(() => hashString(noteId), [noteId]);

  const cat = useMemo(() => {
    const pool =
      mood === "editing"
        ? EDITING_CATS
        : mood === "saving"
          ? SAVING_CATS
          : IDLE_CATS;

    return pool[seed % pool.length];
  }, [seed, mood]);

  const message = useMemo(() => {
    const pool =
      mood === "editing"
        ? EDITING_TEXT
        : mood === "saving"
          ? SAVING_TEXT
          : IDLE_TEXT;

    return pool[seed % pool.length];
  }, [seed, mood]);

  /* Subtle breathing (animal, not emotive) */
  const [breathe, setBreathe] = useState(false);

  useEffect(() => {
    const t = setInterval(() => {
      setBreathe(v => !v);
    }, 1300);
    return () => clearInterval(t);
  }, []);

  /* Save reaction */
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (!saveTick) return;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 500);
    return () => clearTimeout(t);
  }, [saveTick]);

  const face =
    breathe && mood !== "editing"
      ? cat.replace(")", " )")
      : cat;

  return (
    <Box
      flexDirection="column"
      marginBottom={1}
    >
      <Text
        color={flash ? "green" : colors.primary}
        bold={flash}
      >
        {face}
      </Text>

      <Text dimColor={!flash}>
        {message}
      </Text>
    </Box>
  );
}

/* --------------------------------------------------
 * Memoized export
 * -------------------------------------------------- */

export const KawaiiCat = memo(
  KawaiiCatInner,
  (prev, next) =>
    prev.noteId === next.noteId &&
    prev.mood === next.mood &&
    prev.saveTick === next.saveTick
);

