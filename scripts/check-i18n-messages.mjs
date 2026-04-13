import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const rootDir = process.cwd();
const configPath = path.join(rootDir, "src/i18n/config.ts");
const messagesDir = path.join(rootDir, "messages");

function readConfig() {
  const source = fs.readFileSync(configPath, "utf8");
  const localesMatch = source.match(/locales\s*=\s*(\[[^\]]+\])\s*as const/);
  const defaultLocaleMatch = source.match(
    /defaultLocale:\s*Locale\s*=\s*["']([^"']+)["']/
  );

  if (!localesMatch) {
    throw new Error(`Could not find the locales array in ${configPath}`);
  }

  const locales = JSON.parse(localesMatch[1].replaceAll("'", '"'));
  const defaultLocale = defaultLocaleMatch?.[1] ?? locales[0];

  if (!locales.includes(defaultLocale)) {
    throw new Error(
      `Default locale "${defaultLocale}" is not listed in ${configPath}`
    );
  }

  return { locales, defaultLocale };
}

function readMessages(locale) {
  const filePath = path.join(messagesDir, `${locale}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Missing message file: ${path.relative(rootDir, filePath)}`
    );
  }

  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function valueType(value) {
  if (Array.isArray(value)) {
    return "array";
  }

  if (value === null) {
    return "null";
  }

  return typeof value;
}

function flattenMessages(value, pathParts = [], entries = new Map()) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    entries.set(pathParts.join("."), {
      type: "object",
      value,
    });

    for (const [key, childValue] of Object.entries(value)) {
      flattenMessages(childValue, [...pathParts, key], entries);
    }

    return entries;
  }

  entries.set(pathParts.join("."), {
    type: valueType(value),
    value,
  });

  return entries;
}

function leafKeys(entries) {
  return [...entries]
    .filter(([, entry]) => entry.type !== "object")
    .map(([key]) => key)
    .sort();
}

function extractIcuArguments(message) {
  const argumentsSet = new Set();

  for (let index = 0; index < message.length; index += 1) {
    if (message[index] !== "{") {
      continue;
    }

    const match = message
      .slice(index + 1)
      .match(/^([A-Za-z_][\w]*)\s*(?:[,}])/);

    if (match) {
      argumentsSet.add(match[1]);
    }

    let depth = 1;
    index += 1;

    while (index < message.length && depth > 0) {
      if (message[index] === "{") {
        depth += 1;
      } else if (message[index] === "}") {
        depth -= 1;
      }

      index += 1;
    }
  }

  return [...argumentsSet].sort();
}

function extractRichTextTags(message) {
  const tags = new Set();
  const tagPattern = /<\/?([A-Za-z][\w]*)\b[^>]*>/g;

  for (const match of message.matchAll(tagPattern)) {
    tags.add(match[1]);
  }

  return [...tags].sort();
}

function listDifference(left, right) {
  const rightSet = new Set(right);
  return left.filter((item) => !rightSet.has(item));
}

function sameList(left, right) {
  return (
    left.length === right.length &&
    left.every((item, index) => item === right[index])
  );
}

function formatList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function compareLocale(locale, baselineLocale, baselineEntries, localeEntries) {
  const problems = [];
  const baselineLeaves = leafKeys(baselineEntries);
  const localeLeaves = leafKeys(localeEntries);
  const missingKeys = listDifference(baselineLeaves, localeLeaves);
  const extraKeys = listDifference(localeLeaves, baselineLeaves);

  if (missingKeys.length > 0) {
    problems.push(
      `messages/${locale}.json is missing keys from messages/${baselineLocale}.json:\n${formatList(
        missingKeys
      )}`
    );
  }

  if (extraKeys.length > 0) {
    problems.push(
      `messages/${locale}.json has extra keys not found in messages/${baselineLocale}.json:\n${formatList(
        extraKeys
      )}`
    );
  }

  for (const [key, baselineEntry] of baselineEntries) {
    const localeEntry = localeEntries.get(key);

    if (!localeEntry) {
      continue;
    }

    if (baselineEntry.type !== localeEntry.type) {
      problems.push(
        `messages/${locale}.json has a structural mismatch at "${key}": expected ${baselineEntry.type}, found ${localeEntry.type}`
      );
      continue;
    }

    if (localeEntry.type !== "string") {
      continue;
    }

    if (localeEntry.value.trim() === "") {
      problems.push(`messages/${locale}.json has an empty string at "${key}"`);
      continue;
    }

    const baselineArguments = extractIcuArguments(baselineEntry.value);
    const localeArguments = extractIcuArguments(localeEntry.value);

    if (!sameList(baselineArguments, localeArguments)) {
      problems.push(
        `messages/${locale}.json has ICU placeholder mismatch at "${key}": expected {${baselineArguments.join(
          ", "
        )}}, found {${localeArguments.join(", ")}}`
      );
    }

    const baselineTags = extractRichTextTags(baselineEntry.value);
    const localeTags = extractRichTextTags(localeEntry.value);

    if (!sameList(baselineTags, localeTags)) {
      problems.push(
        `messages/${locale}.json has rich-text tag mismatch at "${key}": expected <${baselineTags.join(
          ">, <"
        )}>, found <${localeTags.join(">, <")}>`
      );
    }
  }

  return problems;
}

function main() {
  const { locales, defaultLocale } = readConfig();
  const baselineMessages = readMessages(defaultLocale);
  const baselineEntries = flattenMessages(baselineMessages);
  const problems = [];

  for (const locale of locales) {
    const messages = readMessages(locale);
    const entries = flattenMessages(messages);

    for (const [key, entry] of entries) {
      if (entry.type === "string" && entry.value.trim() === "") {
        problems.push(
          `messages/${locale}.json has an empty string at "${key}"`
        );
      }
    }

    if (locale === defaultLocale) {
      continue;
    }

    problems.push(
      ...compareLocale(locale, defaultLocale, baselineEntries, entries)
    );
  }

  if (problems.length > 0) {
    console.error(
      `i18n message check failed with ${problems.length} problem(s):`
    );
    console.error("");
    console.error(problems.join("\n\n"));
    process.exitCode = 1;
    return;
  }

  console.log(
    `i18n message check passed for ${locales.length} locale(s): ${locales.join(
      ", "
    )}`
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
