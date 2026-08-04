import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getInvalidLinkRedirectPath } from "./redirects.ts";

describe("getInvalidLinkRedirectPath", () => {
  const retryCases = [
    ["signup", "signup"],
    ["email", "magiclink"],
    ["magiclink", "magiclink"],
    ["invite", "invite"],
    ["email_change", "email_change"],
  ] as const;

  for (const [authType, retryType] of retryCases) {
    it(`routes ${authType} failures to the ${retryType} retry flow`, () => {
      const path = getInvalidLinkRedirectPath({
        authType,
        errorMessage: "Link expired",
        locale: "es",
        nextPath: "/profile?tab=account",
      });
      const url = new URL(path, "https://www.peels.org");

      assert.equal(url.pathname, "/auth/retry");
      assert.equal(url.searchParams.get("type"), retryType);
      assert.equal(url.searchParams.get("error"), "Link expired");
      assert.equal(url.searchParams.get("locale"), "es");
      assert.equal(url.searchParams.get("next"), "/profile?tab=account");
    });
  }

  it("keeps password recovery on the forgot-password form", () => {
    assert.equal(
      getInvalidLinkRedirectPath({
        authType: "recovery",
        errorMessage: "Link expired",
        nextPath: "/profile/reset-password",
      }),
      "/forgot-password?error=Link+expired"
    );
  });

  it("uses sign-in as the fallback for unsupported types", () => {
    assert.equal(
      getInvalidLinkRedirectPath({
        authType: "unknown",
        errorMessage: "Link expired",
        nextPath: "/map",
      }),
      "/sign-in?error=Link+expired&redirect_to=%2Fmap"
    );
  });
});
