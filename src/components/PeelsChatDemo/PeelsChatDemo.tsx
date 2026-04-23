import { demoListings } from "@/data/demo/listings";
import { demoThreads } from "@/data/demo/threads";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

const ChatDemoContainer = styled.div`
  width: 95vw;
  max-width: 400px;
  transform: scale(0.88) rotate(-2deg);
  background-color: ${theme.colors.background.top};
  border: 1px solid ${theme.colors.border.base};
  border-radius: ${theme.corners.base};
  padding: 0;
  overflow: hidden;
  @media (min-width: 960px) {
    transform: scale(0.95) rotate(-2.5deg);
    background-color: unset;
    border: unset;
    border-radius: unset;
    padding: unset;
    overflow: unset;
  }
`;

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
