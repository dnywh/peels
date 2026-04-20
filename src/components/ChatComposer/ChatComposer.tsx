"use client";

import Textarea from "@/components/Textarea";
import IconButton from "@/components/IconButton";
import { styled } from "@pigment-css/react";
import FormMessage from "@/components/FormMessage";
import { useTranslations } from "next-intl";

const ChatComposerForm = styled("div")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "stretch",
  gap: "0.5rem",
  borderTop: `1px solid ${theme.colors.border.base}`,
  padding: "1rem",
}));

const ChatComposerInner = styled("form")(({ theme }) => ({
  width: "100%",
  display: "flex",
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "stretch",
  gap: "0.75rem",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginBottom: "0.6rem", // TODO: Make dynamic. Since we're aligning items to the bottom, we need to manually set this to appear horizontally centered
}));

const TextareaComponent = Textarea as React.ComponentType<any>;

type ChatComposerProps = {
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  message: string;
  handleMessageChange: React.ChangeEventHandler<HTMLTextAreaElement>;
  error?: string | null;
  recipientName?: string;
  isDemo?: boolean;
  isSending?: boolean;
};

function ChatComposer({
  onSubmit,
  message,
  handleMessageChange,
  error,
  recipientName,
  isDemo,
  isSending = false,
}: ChatComposerProps) {
  const t = useTranslations();
  const isSendDisabled = !message.trim() || (!isDemo && isSending);

  return (
    <ChatComposerForm>
      {error && <FormMessage message={{ error: error }} />}
      <ChatComposerInner onSubmit={onSubmit} data-testid="chat-composer">
        <TextareaComponent
          variant="chat"
          placeholder={t("Chat.placeholder", {
            name: recipientName || "empty",
          })}
          value={message}
          onChange={handleMessageChange}
          disabled={!isDemo && isSending}
          rows={1}
          data-testid="chat-composer-input"
        />
        <StyledIconButton
          type={isDemo ? "button" : "submit"}
          href={isDemo ? "/#drop-off" : undefined}
          icon="send"
          variant="send"
          aria-label={t("Chat.send")}
          loading={!isDemo && isSending}
          loadingLabel={t("Status.sending")}
          disabled={isSendDisabled}
          data-testid="chat-composer-send"
        />
      </ChatComposerInner>
    </ChatComposerForm>
  );
}

export default ChatComposer;
