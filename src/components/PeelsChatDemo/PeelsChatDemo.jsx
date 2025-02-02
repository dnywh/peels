import { demoListings } from "@/data/demo/listings";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "@pigment-css/react";

const ChatDemoContainer = styled("div")(({ theme }) => ({
  // backgroundColor: theme.colors.background.top,
  // padding: "2.5rem 1rem",
  // border: `1px solid ${theme.colors.border.base}`,
  // borderRadius: `${theme.corners.base}`,

  // padding: "1rem",
  height: "720px",

  width: "95vw",
  maxWidth: "400px",

  transform: `scale(0.88) rotate(-1.5deg)`,
  "@media (min-width: 768px)": {
    transform: `scale(0.95) rotate(-1.5deg)`,
  },
}));

const demoListing = demoListings[2];

const demoThread = {
  chat_messages_with_senders: [
    {
      content: "Hey Becca, are you still accepting food scraps?",
      created_at: "2024-12-27T12:18:46.527046+00:00",
    },
    {
      content:
        "Yes please! We’re home most days after 4pm. Ring the bell at 12 McKellan Dr",
      created_at: "2025-01-21T02:28:26.927079+00:00",
    },
    {
      content: "Amazing! Thank you, I'll try tomorrow afternoon :)",
      created_at: "2025-01-21T02:30:26.927079+00:00",
    },
  ],
};

export default function PeelsChatDemo() {
  return (
    <ChatDemoContainer>
      <ChatWindow
        user={null}
        listing={demoListing}
        existingThread={demoThread}
        isDemo={true}
      />
    </ChatDemoContainer>
  );
}
