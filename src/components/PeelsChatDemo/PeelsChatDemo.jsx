import { demoListings } from "@/data/demo/listings";
import { demoThreads } from "@/data/demo/threads";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "@pigment-css/react";

const ChatDemoContainer = styled("div")(({ theme }) => ({
  // height: "690px",

  width: "95vw",
  maxWidth: "400px",

  transform: `scale(0.88) rotate(-2deg)`,

  // The chat window is usually 'unstyled' on mobile because it lives full-screen
  // So we need to add a container style for this demo case
  backgroundColor: theme.colors.background.top,
  padding: "2.5rem 1rem",
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: `${theme.corners.base}`,
  padding: "0",
  overflow: "hidden",

  "@media (min-width: 960px)": {
    transform: `scale(0.95) rotate(-2.5deg)`,

    // Undo all those container styles
    backgroundColor: "unset",
    border: "unset",
    borderRadius: "unset",
    padding: "unset",
    overflow: "unset",
  },
}));

export default function PeelsChatDemo() {
  return (
    <ChatDemoContainer>
      <ChatWindow
        user={null}
        listing={demoListings[2]}
        existingThread={demoThreads[0]}
        isDemo={true}
      />
    </ChatDemoContainer>
  );
}
