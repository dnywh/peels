import { defineConfig } from "@playwright/test";
import { sharedPlaywrightConfig, sharedWebServer } from "./playwright.shared";

export default defineConfig({
  ...sharedPlaywrightConfig,
  webServer: {
    ...sharedWebServer,
    command: "npm run start -- --hostname 127.0.0.1 --port 3000",
    reuseExistingServer: false,
  },
});
