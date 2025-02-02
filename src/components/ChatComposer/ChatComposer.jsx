import Textarea from "@/components/Textarea";
import SubmitButton from "@/components/SubmitButton";
import IconButton from "@/components/IconButton";
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
  alignItems: "flex-end",
  justifyContent: "stretch",
  gap: "0.75rem",
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  marginBottom: "0.6rem", // TODO: Make dynamic. Since we're aligning items to the bottom, we need to manually set this to appear horizontally centered
}));

function ChatComposer({
  onSubmit,
  message,
  handleMessageChange,
  error,
  recipientName,
  isDemo,
}) {
  return (
    <ChatComposerForm>
      {error && <FormMessage message={{ error: error }} />}
      <ChatComposerInner onSubmit={onSubmit}>
        <Textarea
          variant="chat"
          placeholder={`Send a message${recipientName && ` to ${recipientName}`}...`}
          value={message}
          onChange={handleMessageChange}
          rows={1}
        />
        {/* <SubmitButton pendingText="Sending...">Send</SubmitButton> */}
        <StyledIconButton
          type={isDemo ? "button" : "submit"}
          href={isDemo ? "/#drop-off" : undefined}
          icon="send"
          variant="send"
          // TODO: Some sort of Aria label to indicate this is a 'Send' button
          disabled={!message.trim()}
        />
      </ChatComposerInner>
    </ChatComposerForm>
  );
}

export default ChatComposer;
