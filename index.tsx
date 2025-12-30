import { render, } from "ink";
import App from "./src/App.js";

// Clear screen before rendering
process.stdout.write('\x1Bc');

render(<App />, {
  clearScreen: true,
} as any);


