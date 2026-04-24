import { formatTimestamp } from "@/utils/dateUtils";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

const sentContainerStyles = css`
  align-items: flex-end;
`;

const receivedContainerStyles = css`
  align-items: flex-start;
`;

type ChatDirection = "sent" | "received";

const ChatMessageContainer = styled.div<{ $direction: ChatDirection }>`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  ${({ $direction }) =>
    $direction === "sent" ? sentContainerStyles : receivedContainerStyles}
`;

const sentBubbleStyles = css`
  margin-left: 30%;
  background-color: ${theme.colors.message.sent.background};
  color: ${theme.colors.message.sent.text};
  text-shadow: 0 0.35px 1px rgba(0, 0, 0, 0.1);
`;

const receivedBubbleStyles = css`
  margin-right: 30%;
  background-color: ${theme.colors.message.received.background};
  color: ${theme.colors.message.received.text};
`;

const ChatBubble = styled.p<{ $direction: ChatDirection }>`
  padding: 0.65rem 1rem;
  border-radius: 1.5rem;

  ${({ $direction }) =>
    $direction === "sent" ? sentBubbleStyles : receivedBubbleStyles}
`;

const Timestamp = styled.p`
  color: ${theme.colors.text.ui.quaternary};
  font-size: 0.75rem;
  margin: 0 0.625rem;
`;

function ChatMessage({
  direction,
  message,
  locale,
  timeZone,
}: {
  direction: ChatDirection;
  message: { content: string; created_at: string };
  locale: string;
  timeZone: string;
}) {
  return (
    <ChatMessageContainer $direction={direction}>
      <ChatBubble $direction={direction}>{message.content}</ChatBubble>
      <Timestamp data-testid="chat-message-timestamp">
        {formatTimestamp(message.created_at, {
          locale,
          timeZone,
        })}
      </Timestamp>
    </ChatMessageContainer>
  );
}

export default ChatMessage;
