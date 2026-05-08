import { expect, test } from "@playwright/test";
import {
  DONOR_EMAIL,
  HOST_EMAIL,
  HOST_SECOND_SEEDED_THREAD_ID,
  SECOND_SEEDED_THREAD_ID,
  SEEDED_THREAD_ID,
  delayChatSendRequests,
  failChatSendRequests,
  signIn,
} from "./helpers";

test("chat loads the seeded thread and composer for a signed-in donor", async ({
  page,
}) => {
  const maxUpdateDepthErrors: string[] = [];
  const recordMaxUpdateDepthError = (message: string) => {
    if (message.includes("Maximum update depth exceeded")) {
      maxUpdateDepthErrors.push(message);
    }
  };

  page.on("console", (message) => {
    recordMaxUpdateDepthError(message.text());
  });
  page.on("pageerror", (error) => {
    recordMaxUpdateDepthError(error.message);
  });

  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });

  await expect(page).toHaveURL(new RegExp(`/chats/${SEEDED_THREAD_ID}$`));
  await expect(page.getByTestId("chat-window")).toBeVisible();
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Hey Avery, do you take coffee grounds from a small home espresso machine?"
  );
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Yes, absolutely. Small sealed containers are perfect."
  );
  await expect(page.getByTestId("chat-composer")).toBeVisible();
  await expect(page.getByTestId("chat-composer-input")).toBeVisible();
  await page
    .getByTestId("thread-list")
    .evaluate((element) => element.setAttribute("data-persist-check", "true"));

  await page.getByTestId(`thread-preview-${SECOND_SEEDED_THREAD_ID}`).click();
  await expect(page).toHaveURL(
    new RegExp(`/chats/${SECOND_SEEDED_THREAD_ID}$`)
  );
  await expect(page.getByTestId("thread-list")).toHaveAttribute(
    "data-persist-check",
    "true"
  );
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Hi Morgan, are banana peels okay if they are chopped up?"
  );
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Yes please. Chopped scraps break down much faster in this bay."
  );

  await page.getByTestId(`thread-preview-${SEEDED_THREAD_ID}`).click();
  await expect(page).toHaveURL(new RegExp(`/chats/${SEEDED_THREAD_ID}$`));
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Yes, absolutely. Small sealed containers are perfect."
  );

  await page.waitForTimeout(250);
  expect(maxUpdateDepthErrors).toEqual([]);
});

test("chat lists multiple seeded threads for a signed-in host", async ({
  page,
}) => {
  await signIn(page, {
    email: HOST_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });

  await expect(page).toHaveURL(new RegExp(`/chats/${SEEDED_THREAD_ID}$`));
  await expect(page.getByTestId("thread-list")).toBeVisible();
  await expect(
    page.getByTestId(`thread-preview-${HOST_SECOND_SEEDED_THREAD_ID}`)
  ).toContainText("Morgan");

  await page
    .getByTestId(`thread-preview-${HOST_SECOND_SEEDED_THREAD_ID}`)
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/chats/${HOST_SECOND_SEEDED_THREAD_ID}$`)
  );
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Hi Avery, can the cafe take a few buckets from our community garden working bee?"
  );
  await expect(page.getByTestId("chat-message-list")).toContainText(
    "Yes, drop them by after 3 pm and I'll add them to the cafe pickup."
  );
});

test("chat send disables the composer while pending and appends the new message", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });
  await delayChatSendRequests(page);

  const composerInput = page.getByTestId("chat-composer-input");
  const sendButton = page.getByTestId("chat-composer-send");
  const message = `Playwright chat message ${Date.now()}`;

  await composerInput.click();
  await composerInput.pressSequentially(message);
  await expect(sendButton).toBeEnabled();

  const messageVisible = page
    .getByTestId("chat-message-list")
    .getByText(message);
  await sendButton.click();
  await expect(sendButton).toBeDisabled();
  await expect(sendButton).toHaveAttribute("aria-busy", "true");
  await expect(composerInput).toBeDisabled();
  await expect(messageVisible).toBeVisible();
  await expect(composerInput).toHaveValue("");
  await expect
    .poll(async () =>
      page.evaluate((threadId) => {
        const draftEntry = Object.entries(sessionStorage).find(([key]) =>
          key.endsWith(`:${threadId}`)
        );

        return draftEntry?.[1] ?? null;
      }, SEEDED_THREAD_ID)
    )
    .toBeNull();
});

test("chat send failures preserve the draft and show inline feedback", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });
  await failChatSendRequests(page);

  const composerInput = page.getByTestId("chat-composer-input");
  const failedMessage = `Chat failure draft ${Date.now()}`;

  await composerInput.click();
  await composerInput.pressSequentially(failedMessage);
  await expect(page.getByTestId("chat-composer-send")).toBeEnabled();
  await page.getByTestId("chat-composer-send").click();

  await expect(composerInput).toHaveValue(failedMessage);
  await expect(page.getByText("Synthetic chat failure")).toBeVisible();
});

test("chat preserves unsent drafts when switching threads", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });

  const composerInput = page.getByTestId("chat-composer-input");
  const draftMessage = `Thread switch draft ${Date.now()}`;

  await composerInput.click();
  await composerInput.pressSequentially(draftMessage);
  await expect(composerInput).toHaveValue(draftMessage);

  await page.getByTestId(`thread-preview-${SECOND_SEEDED_THREAD_ID}`).click();
  await expect(page).toHaveURL(
    new RegExp(`/chats/${SECOND_SEEDED_THREAD_ID}$`)
  );
  await expect(page.getByTestId("chat-composer-input")).toHaveValue("");

  await page.getByTestId(`thread-preview-${SEEDED_THREAD_ID}`).click();
  await expect(page).toHaveURL(new RegExp(`/chats/${SEEDED_THREAD_ID}$`));
  await expect(page.getByTestId("chat-composer-input")).toHaveValue(
    draftMessage
  );
});

test("chat restores unsent drafts after leaving and returning in the same tab", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });

  const draftMessage = `Route return draft ${Date.now()}`;

  await page.getByTestId("chat-composer-input").pressSequentially(draftMessage);
  await expect(page.getByTestId("chat-composer-input")).toHaveValue(
    draftMessage
  );

  page.once("dialog", async (dialog) => {
    expect(dialog.type()).toBe("beforeunload");
    await dialog.accept();
  });
  await page.goto("/chats");
  await expect(page.getByTestId("thread-list")).toBeVisible();

  await page.goto(`/chats/${SEEDED_THREAD_ID}`);
  await expect(
    page.getByRole("textbox", { name: "Send a message to Avery..." })
  ).toHaveValue(draftMessage);
});

test("unsent chat drafts warn before closing or reloading the page", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });

  const composerInput = page.getByTestId("chat-composer-input");
  await composerInput.click();
  await composerInput.pressSequentially(`Unsent chat draft ${Date.now()}`);

  const dialogPromise = page.waitForEvent("dialog");
  const reloadPromise = page.reload({ waitUntil: "domcontentloaded" });
  const dialog = await dialogPromise;
  expect(dialog.type()).toBe("beforeunload");
  await dialog.accept();
  await reloadPromise;
});

test("empty chat composers reload without an unsaved draft warning", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: `/chats/${SEEDED_THREAD_ID}`,
  });

  await expect(page.getByTestId("chat-composer-input")).toHaveValue("");

  const dialogMessages: string[] = [];
  page.once("dialog", async (dialog) => {
    dialogMessages.push(dialog.message());
    await dialog.dismiss();
  });

  await page.reload({ waitUntil: "domcontentloaded" });

  expect(dialogMessages).toEqual([]);
});

test("invalid chat thread ids redirect back to the chat index", async ({
  page,
}) => {
  await signIn(page, {
    email: DONOR_EMAIL,
    redirectTo: "/chats/not-a-real-thread",
    expectedPath: "/chats",
  });

  await expect(page).toHaveURL(/\/chats$/);
  await expect(page.getByTestId("thread-list")).toBeVisible();
});
