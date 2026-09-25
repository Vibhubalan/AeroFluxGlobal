import { cpSync, existsSync, rmSync } from "node:fs";

// Hostinger publishes `dist` and may already export the site there.
// A normal `output: "export"` build writes `out` instead.
if (existsSync("out")) {
  rmSync("dist", { recursive: true, force: true });
  cpSync("out", "dist", { recursive: true });
} else if (!existsSync("dist/index.html")) {
  console.error("Static export was not created. Expected out/ or dist/index.html.");
  process.exit(1);
}
