import { cp, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceDir = join(projectRoot, "src");
const outputDir = join(projectRoot, "dist");

await rm(outputDir, { force: true, recursive: true });
await cp(sourceDir, outputDir, { recursive: true });

console.log("Built peels-org static site to dist/");
