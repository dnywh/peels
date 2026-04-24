import test from "node:test";
import assert from "node:assert/strict";
import {
  CHAT_RENDER_TIME_ZONE,
  formatTimestamp,
  formatWeekday,
  getChatDateKey,
} from "./dateUtils.ts";

test("chat date formatting stays deterministic for explicit locale and timezone", () => {
  const messageDate = "2025-05-01T20:10:00.000Z";

  assert.equal(
    formatTimestamp(messageDate, {
      locale: "en",
      timeZone: CHAT_RENDER_TIME_ZONE,
    }),
    "08:10 PM"
  );
  assert.equal(
    formatWeekday(messageDate, {
      locale: "en",
      timeZone: CHAT_RENDER_TIME_ZONE,
      now: "2025-05-02T06:48:00.000Z",
    }),
    "Thu, May 1"
  );
  assert.equal(
    getChatDateKey(messageDate, {
      timeZone: CHAT_RENDER_TIME_ZONE,
    }),
    "2025-05-01"
  );
});

test("chat day labels include the year when the reference year differs", () => {
  assert.equal(
    formatWeekday("2024-12-31T23:15:00.000Z", {
      locale: "en",
      timeZone: CHAT_RENDER_TIME_ZONE,
      now: "2025-01-01T00:15:00.000Z",
    }),
    "Tue, Dec 31, 2024"
  );
});
