import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const rootDir = resolve(__filename, "..", "..");
const distDir = resolve(rootDir, "dist");

async function build() {
  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });

  await cp(resolve(rootDir, "index.html"), resolve(distDir, "index.html"));
  await cp(resolve(rootDir, "src"), resolve(distDir, "src"), { recursive: true });
}

build().then(() => {
  console.log("Static build complete.");
}).catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
