import test from "node:test";
import assert from "node:assert/strict";

import { parseInlineText, parseTextWithLinks } from "./linkUtils.ts";

test("parseTextWithLinks autolinks bare URLs", () => {
  const parts = parseTextWithLinks("see example.com today");

  assert.equal(parts.length, 3);
  assert.equal(parts[0], "see ");
  assert.deepEqual(parts[1], {
    type: "link",
    href: "https://example.com",
    text: "example.com",
  });
  assert.equal(parts[2], " today");
});

test("parseInlineText renders bold markers", () => {
  const parts = parseInlineText("**Hours:** 24/7");

  assert.equal(parts.length, 2);
  assert.deepEqual(parts[0], {
    type: "bold",
    parts: ["Hours:"],
  });
  assert.equal(parts[1], " 24/7");
});

test("parseInlineText keeps links outside bold segments", () => {
  const parts = parseInlineText("**Notes:** visit example.com");

  assert.deepEqual(parts[0], {
    type: "bold",
    parts: ["Notes:"],
  });
  assert.equal(parts[1], " visit ");
  assert.deepEqual(parts[2], {
    type: "link",
    href: "https://example.com",
    text: "example.com",
  });
});
