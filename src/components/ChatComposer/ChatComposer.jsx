import Textarea from "@/components/Textarea";
import SubmitButton from "@/components/SubmitButton";
import { styled } from "@pigment-css/react";
import FormMessage from "@/components/FormMessage";

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
  alignItems: "center",
  justifyContent: "stretch",
  gap: "1rem",
}));

function ChatComposer({ onSubmit, message, handleMessageChange, error }) {
  return (
    <ChatComposerForm>
      {error && <FormMessage message={{ error: error }} />}
      <ChatComposerInner onSubmit={onSubmit}>
        <Textarea
          placeholder="Send a message!..."
          value={message}
          onChange={handleMessageChange}
          rows={1}
        />
        <SubmitButton pendingText="Sending...">Send</SubmitButton>
      </ChatComposerInner>
    </ChatComposerForm>
  );
}

export default ChatComposer;
