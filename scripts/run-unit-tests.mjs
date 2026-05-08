import { readdirSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

function collectTestFiles(directory) {
  return readdirSync(directory, { withFileTypes: true })
    .flatMap((entry) => {
      const entryPath = join(directory, entry.name);

      if (entry.isDirectory()) {
        return collectTestFiles(entryPath);
      }

      return entry.isFile() && entry.name.endsWith(".test.ts")
        ? [entryPath]
        : [];
    })
    .sort();
}

const testFiles = collectTestFiles("src");

if (testFiles.length === 0) {
  console.error("No unit test files found.");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  ["--test", "--experimental-strip-types", ...testFiles],
  {
    stdio: "inherit",
  }
);

if (result.error) {
  throw result.error;
}

if (result.signal) {
  console.error(`Unit test process exited with signal ${result.signal}.`);
  process.exit(1);
}

process.exit(result.status ?? 1);
