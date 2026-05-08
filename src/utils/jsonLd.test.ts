import test from "node:test";
import assert from "node:assert/strict";

import { serializeJsonLd } from "./jsonLd.ts";

test("JSON-LD serialization falls back safely for undefined data", () => {
  assert.equal(serializeJsonLd(undefined), "null");
});

test("JSON-LD serialization falls back safely for unsupported data", () => {
  const circular: { self?: unknown } = {};
  circular.self = circular;

  assert.equal(serializeJsonLd(BigInt(1)), "null");
  assert.equal(serializeJsonLd(circular), "null");
});

test("JSON-LD serialization escapes HTML tag openings", () => {
  assert.equal(
    serializeJsonLd({ name: "<script>alert('x')</script>" }),
    `{"name":"\\u003cscript>alert('x')\\u003c/script>"}`
  );
});
