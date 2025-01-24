import StorageImage from "@/components/StorageImage";
import { formatDate } from "@/utils/dateUtils";
import { styled } from "@pigment-css/react";

const StyledChatMessageContainer = styled("div")({
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
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

const StyledChatMessage = styled("p")({
  backgroundColor: "#e0e0e0",
  padding: "0.65rem 1rem",
  borderRadius: "2rem",
  variants: [
    {
      props: { direction: "sent" },
      style: {
        backgroundColor: "#e0e0e0",
        textAlign: "right",
      },
    },
    {
      props: { direction: "received" },
      style: {
        backgroundColor: "#f0f0f0",
        textAlign: "left",
      },
    },
  ],
});

function ChatMessage({ direction, message }) {
  return (
    <StyledChatMessageContainer direction={direction}>
      {message.sender_avatar && (
        <StorageImage
          bucket="avatars"
          filename={message.sender_avatar}
          alt={`Avatar for ${message.sender_first_name}`}
          width={64}
          height={64}
        />
      )}
      <StyledChatMessage direction={direction}>
        {message.content}
      </StyledChatMessage>
      <p>
        <small>Sent by {message.sender_first_name}</small>
      </p>
      <p>
        <small>{formatDate(message.created_at)}</small>
      </p>
    </StyledChatMessageContainer>
  );
}

export default ChatMessage;
