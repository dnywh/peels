import { expect, test } from "@playwright/test";
import {
  DONOR_EMAIL,
  SEEDED_THREAD_ID,
  delayChatSendRequests,
  failChatSendRequests,
  signIn,
} from "./helpers";

test("chat loads the seeded thread and composer for a signed-in donor", async ({
  page,
}) => {
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

  await composerInput.fill(message);

  const messageVisible = page
    .getByTestId("chat-message-list")
    .getByText(message);
  await sendButton.click();
  await expect(sendButton).toBeDisabled();
  await expect(sendButton).toHaveAttribute("aria-busy", "true");
  await expect(composerInput).toBeDisabled();
  await expect(messageVisible).toBeVisible();
  await expect(composerInput).toHaveValue("");
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

  await composerInput.fill(failedMessage);
  await page.getByTestId("chat-composer-send").click();

  await expect(composerInput).toHaveValue(failedMessage);
  await expect(page.getByText("Synthetic chat failure")).toBeVisible();
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
