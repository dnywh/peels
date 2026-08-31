#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

import {
  buildPortPhillipExternalId,
  formatPortPhillipStreetNumber,
  normalisePortPhillipCouncilText,
  normalisePortPhillipSuburb,
} from "../supabase/functions/_shared/open-data/port-phillip-fogo.ts";

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
);

function asString(value) {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function asNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  const raw = asString(value);
  if (!raw) {
    return null;
  }

  const parsed = Number.parseFloat(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

function parsePortPhillipWorkbook(buffer) {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: null,
    raw: true,
  });

  const records = [];

  for (const row of rows.slice(2)) {
    if (!Array.isArray(row) || !row[7]) {
      continue;
    }

    const fogoWasteType = asString(row[8]);
    if (fogoWasteType?.toUpperCase() !== "FOGO") {
      continue;
    }

    const siteName = normalisePortPhillipCouncilText(asString(row[7]));
    const suburb = normalisePortPhillipSuburb(
      asString(row[2]) ?? "Port Phillip"
    );
    const latitude = asNumber(row[4]);
    const longitude = asNumber(row[5]);
    const collectionLocation = normalisePortPhillipCouncilText(
      asString(row[11])
    );

    if (!siteName || latitude === null || longitude === null) {
      continue;
    }

    records.push({
      externalId: buildPortPhillipExternalId({
        siteName,
        collectionLocation,
        latitude,
        longitude,
      }),
      siteName,
      streetNumber: formatPortPhillipStreetNumber(row[0]),
      streetName: normalisePortPhillipCouncilText(asString(row[1])),
      suburb,
      latitude,
      longitude,
      propertyType: asString(row[6]),
      collectionLocation,
      fogoBinCount: asNumber(row[9]),
      fogoBinSize: asString(row[10]),
    });
  }

  return records;
}

function usage() {
  console.error(`Usage: npm run sanitize:open-data -- <source-id> <input.xlsx> [output.json]

Sources:
  port-phillip-fogo-communal   City of Port Phillip communal FOGO spreadsheet
`);
}

const sourceId = process.argv[2];
const inputPath = process.argv[3];

if (!sourceId || !inputPath) {
  usage();
  process.exit(1);
}

if (sourceId !== "port-phillip-fogo-communal") {
  console.error(`Unsupported source id: ${sourceId}`);
  usage();
  process.exit(1);
}

const absoluteInput = path.resolve(inputPath);
const inputBuffer = readFileSync(absoluteInput);
const records = parsePortPhillipWorkbook(inputBuffer);

const outputPath =
  process.argv[4] ??
  path.join(repoRoot, "data", "open-data-sanitized", `${sourceId}.json`);

const payload = {
  sourceId,
  sanitizedAt: new Date().toISOString(),
  sourceFile: {
    path: absoluteInput,
    sha256: createHash("sha256").update(inputBuffer).digest("hex"),
  },
  recordCount: records.length,
  records,
};

mkdirSync(path.dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      sourceId,
      outputPath,
      recordCount: records.length,
      sourceFileSha256: payload.sourceFile.sha256,
    },
    null,
    2
  )
);
