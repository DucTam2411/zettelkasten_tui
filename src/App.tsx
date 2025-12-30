import React, { useState } from "react";
import { Box, Text } from "ink";
import type { Screen } from "./types.js";
import List from "./screens/List.js";
import Editor from "./screens/Editor.js";
import { TitledBox, titleStyles } from "@mishieck/ink-titled-box";
import { colors } from "./theme.js";
import AnimatedCat from "./components/AnimatedCat.js";

export default function App() {
  const [screen, setScreen] = useState<Screen>("list");
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <TitledBox
      flexDirection="column"
      borderStyle="round"
      titles={["Zettelkasten"]}
      titleStyles={titleStyles.pill}
      width={120}
      borderColor={colors.primary}

      margin={4}
    >

      {screen === "list" && <AnimatedCat />}
      <Box paddingTop={1} paddingLeft={2}>
        <Text dimColor>
          {screen === "list" ? "Notes" : `Editing ${activeId}`}
        </Text>
      </Box>



      <Box marginTop={1} flexGrow={1} padding={2}>
        {screen === "list" && (
          <List
            onOpen={(id) => {
              setActiveId(id);
              setScreen("editor");
            }}
          />
        )}

        {screen === "editor" && activeId && (
          <Editor
            id={activeId}
            onBack={() => setScreen("list")}
          />
        )}
      </Box>

      {/* Footer */}
      <Box marginTop={1} paddingLeft={2}>
        <Text dimColor>
          {screen === "list"
            ? ""
            : "Esc: back  ·  Ctrl+S: save"}
        </Text>
      </Box>
    </TitledBox>
  );
}

