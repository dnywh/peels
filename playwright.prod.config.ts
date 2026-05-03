import { defineConfig } from "@playwright/test";
import {
  playwrightHost,
  playwrightPort,
  sharedPlaywrightConfig,
  sharedWebServer,
} from "./playwright.shared";

export default defineConfig({
  ...sharedPlaywrightConfig,
  webServer: {
    ...sharedWebServer,
    command: `npm run start -- --hostname ${playwrightHost} --port ${playwrightPort}`,
    reuseExistingServer: false,
  },
});
