import { Box, Text } from "ink";

type Props = {
  notes: { updatedAt: number }[];
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MONTH_COUNT = 4;

const WEEK_COLS = 7;
const CELL_WIDTH = 2;
const MONTH_WIDTH = WEEK_COLS * CELL_WIDTH;

function localDateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/* ---------------- Light color scale (primary-based) ---------------- */
/* primary = #F6F0D7 */

function colorFor(count: number) {
  if (count === 0) return "#ECE7D3"; // empty (very light)
  if (count === 1) return "#F6EAC2";
  if (count === 2) return "#F6E1A3";
  if (count === 3) return "#F6D982"; // primary-adjacent
  return "#EED05E"; // strongest activity
}

/* ---------------- Helpers ---------------- */
function monthGrid(year: number, month: number, counts: Record<string, number>) {
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);

  const startOffset = (first.getDay() + 6) % 7;
  const totalDays = last.getDate();

  const grid: number[][] = Array.from({ length: 7 }, () => []);

  let day = 1;
  while (day <= totalDays) {
    for (let row = 0; row < 7; row++) {
      if (grid[row].length === 0 && row < startOffset) {
        grid[row].push(0);
      } else if (day <= totalDays) {
        const d = new Date(year, month, day);
        const key = localDateKey(d);
        grid[row].push(counts[key] || 0);
        day++;
      }
    }
  }

  for (let r = 0; r < 7; r++) {
    while (grid[r].length < WEEK_COLS) {
      grid[r].push(0);
    }
  }

  return grid;
}

/* ---------------- Component ---------------- */

export default function Heatmap({ notes }: Props) {
  const counts: Record<string, number> = {};

  for (const note of notes) {
    const d = new Date(note.updatedAt);
    const key = localDateKey(d);
    counts[key] = (counts[key] || 0) + 1;
  }

  const now = new Date();
  const months = Array.from({ length: MONTH_COUNT }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (MONTH_COUNT - 1 - i), 1);
    return {
      label: d.toLocaleString("default", { month: "short", year: "numeric" }),
      grid: monthGrid(d.getFullYear(), d.getMonth(), counts),
    };
  });

  const maxCols = Math.max(...months.map(m => m.grid[0].length));

  for (const m of months) {
    for (let r = 0; r < 7; r++) {
      while (m.grid[r].length < maxCols) {
        m.grid[r].push(0);
      }
    }
  }

  return (
    <Box flexDirection="column">
      {/* Month labels */}
      <Box paddingLeft={4} marginBottom={1}>
        <Text color="#B7B29C">
          {months.map(m => m.label.padEnd(MONTH_WIDTH)).join("  ")}
        </Text>
      </Box>

      {/* Grid */}
      {DAYS.map((day, row) => (
        <Text key={day}>
          <Text color="#B7B29C">{day} </Text>
          {months.map((m, mi) => (
            <Text key={mi}>
              {m.grid[row].map((c, i) => (
                <Text key={i} color={colorFor(c)}>
                  {c === 0 ? "░░" : "██"}
                </Text>
              ))}
              {"  "}
            </Text>
          ))}
        </Text>
      ))}

      {/* Legend */}
      <Box marginTop={1}>
        <Text color="#B7B29C">
          ░░ none{"   "}
          <Text color="#F6D982">██</Text> active
        </Text>
      </Box>
    </Box>
  );
}

