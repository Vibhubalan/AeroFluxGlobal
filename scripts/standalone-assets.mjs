import { cpSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const server = ".next/standalone/server.js";

if (!existsSync(server)) {
  console.error("Next.js did not create .next/standalone/server.js");
  process.exit(1);
}

const source = readFileSync(server, "utf8").replace(
  "const hostname = process.env.HOSTNAME || '0.0.0.0'",
  "const hostname = '0.0.0.0'",
);
writeFileSync(server, source);

cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
if (existsSync("public")) {
  cpSync("public", ".next/standalone/public", { recursive: true });
}
