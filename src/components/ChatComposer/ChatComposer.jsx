import Textarea from "@/components/Textarea";
import SubmitButton from "@/components/SubmitButton";
import { styled } from "@pigment-css/react";

const ChatComposerForm = styled("form")(({ theme }) => ({
  // width: "100%",
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "stretch",
  gap: "1rem",
  borderTop: `1px solid ${theme.colors.border.base}`,
  padding: "1rem",
}));

function ChatComposer({ onSubmit, message, handleMessageChange }) {
  return (
    <ChatComposerForm onSubmit={onSubmit}>
      <Textarea
        placeholder="Send a message!..."
        value={message}
        onChange={handleMessageChange}
        rows={1}
      />
      <SubmitButton pendingText="Sending...">Send</SubmitButton>
    </ChatComposerForm>
  );
}

export default ChatComposer;
