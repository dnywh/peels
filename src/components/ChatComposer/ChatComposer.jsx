import Textarea from "@/components/Textarea";
import SubmitButton from "@/components/SubmitButton";
import { styled } from "@pigment-css/react";

const ChatComposerForm = styled("form")({
  // flex: 1,
  display: "flex",
  flexDirection: "row",
  alignItems: "stretch",
  justifyContent: "stretch",
  gap: "1rem",
});

function ChatComposer({ onSubmit, message, handleMessageChange }) {
  return (
    <ChatComposerForm onSubmit={onSubmit}>
      <Textarea
        placeholder="Send a message!..."
        value={message}
        onChange={handleMessageChange}
      />
      <SubmitButton pendingText="Sending...">Send</SubmitButton>
    </ChatComposerForm>
  );
}

export default ChatComposer;
