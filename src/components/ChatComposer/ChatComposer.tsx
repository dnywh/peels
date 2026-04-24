"use client";
import { theme } from "@/styles/theme.yak";

import Textarea from "@/components/Textarea";
import IconButton from "@/components/IconButton";
import { styled } from "next-yak";
import FormMessage from "@/components/FormMessage";
import { useTranslations } from "next-intl";
import type { FormSubmitHandler } from "@/types/events";

const ChatComposerForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: stretch;
  gap: 0.5rem;
  border-top: 1px solid ${theme.colors.border.base};
  padding: 1rem;
`;

const ChatComposerInner = styled.form`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: stretch;
  gap: 0.75rem;
`;

const StyledIconButton = styled(IconButton)`
  align-self: center;
`;

const TextareaComponent = Textarea as React.ComponentType<any>;

type ChatComposerProps = {
  onSubmit: FormSubmitHandler;
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
