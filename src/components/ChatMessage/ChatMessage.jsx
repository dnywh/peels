import { formatTimestamp } from "@/utils/dateUtils";
import { styled } from "@pigment-css/react";

const ChatMessageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",

  variants: [
    {
      props: { direction: "sent" },
      style: {
        textAlign: "right",
        alignItems: "flex-end",
      },
    },
    {
      props: { direction: "received" },
      style: {
        textAlign: "left",
        alignItems: "flex-start",
      },
    },
  ],
});

const ChatBubble = styled("p")(({ theme }) => ({
  padding: "0.65rem 1rem",
  borderRadius: "1.5rem",
  // textWrap: "balance",
  variants: [
    {
      props: { direction: "sent" },
      style: {
        // marginLeft: "7cqi", // https://moderncss.dev/container-query-units-and-fluid-typography/#container-query-units
        marginLeft: "30%",
        backgroundColor: theme.colors.message.sent.background,
        color: theme.colors.message.sent.text,
        textAlign: "right",
        textShadow: `0 0.35px 1px rgba(0, 0, 0, .1)`, // To increase contrast of text
      },
    },
    {
      props: { direction: "received" },
      style: {
        // marginRight: "7cqi",
        marginRight: "30%",
        backgroundColor: theme.colors.message.received.background,
        color: theme.colors.message.received.text,
        textAlign: "left",
      },
    },
  ],
}));

const Timestamp = styled("p")(({ theme }) => ({
  color: theme.colors.text.ui.quaternary,
  fontSize: "0.75rem",
  margin: "0 0.625rem", // Inset to visually align with chat bubble
}));

function ChatMessage({ direction, message }) {
  return (
    <ChatMessageContainer direction={direction}>
      <ChatBubble direction={direction}>{message.content}</ChatBubble>
      <Timestamp>{formatTimestamp(message.created_at)}</Timestamp>
    </ChatMessageContainer>
  );
}

export default ChatMessage;
