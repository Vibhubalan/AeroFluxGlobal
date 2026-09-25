import { cpSync, existsSync } from "node:fs";

const server = ".next/standalone/server.js";

if (!existsSync(server)) {
  console.error("Next.js did not create .next/standalone/server.js");
  process.exit(1);
}

cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
if (existsSync("public")) {
  cpSync("public", ".next/standalone/public", { recursive: true });
}
