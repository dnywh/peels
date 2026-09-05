import assert from "node:assert/strict";
import test from "node:test";
import {
  createSupportReference,
  sanitiseSupportPageUrl,
} from "./supportError.ts";

test("createSupportReference prefixes a UUID with its support scope", () => {
  assert.match(
    createSupportReference("auth"),
    /^auth-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  );
});

test("sanitiseSupportPageUrl removes queries and fragments", () => {
  assert.equal(
    sanitiseSupportPageUrl(
      "https://peels.org/profile/listings/new/business?token=secret#private"
    ),
    "https://peels.org/profile/listings/new/business"
  );
  assert.equal(
    sanitiseSupportPageUrl("/sign-up?email=private@example.com#form"),
    "/sign-up"
  );
});
