import type { PlaywrightTestConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:3000";

const sharedPlaywrightUse: PlaywrightTestConfig["use"] = {
  baseURL,
  headless: true,
  locale: "en-AU",
  launchOptions:
    process.platform === "darwin" ? { chromiumSandbox: true } : undefined,
  extraHTTPHeaders: {
    "Accept-Language": "en-AU,en;q=0.9",
  },
  trace: "retain-on-failure",
  video: "retain-on-failure",
  screenshot: "only-on-failure",
  viewport: {
    width: 1280,
    height: 900,
  },
};

const sharedPlaywrightConfig = {
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? "github" : "list",
  use: sharedPlaywrightUse,
  projects: [
    {
      name: "chromium",
    },
  ],
} satisfies Omit<PlaywrightTestConfig, "webServer">;

const sharedWebServer = {
  url: baseURL,
  reuseExistingServer: !process.env.CI,
  timeout: 120_000,
};

export { sharedPlaywrightConfig, sharedWebServer };
