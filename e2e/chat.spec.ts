import { expect, test } from "@playwright/test";
import { DONOR_EMAIL, SEEDED_THREAD_ID, signIn } from "./helpers";

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
