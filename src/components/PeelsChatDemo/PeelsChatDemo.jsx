import { demoListings } from "@/data/demo/listings";
import ChatWindow from "@/components/ChatWindow";
import { styled } from "@pigment-css/react";

const ChatDemoContainer = styled("div")(({ theme }) => ({
  backgroundColor: theme.colors.background.top,
  padding: "2.5rem 1rem",
  border: `1px solid ${theme.colors.border.base}`,
  borderRadius: `${theme.corners.base}`,

  padding: "1rem",
  height: "512px",
}));

const demoListing = demoListings[0];

const existingThread = {
  id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
  created_at: "2024-12-27T12:18:46.411134+00:00",
  listing_id: 1,
  initiator_id: "3f801ffe-aa00-402c-8d52-a71674e5e450",
  owner_id: "b66e3cac-3466-41dd-aa49-4d8697dc26cb",
  initiator_first_name: "Sofie B",
  owner_first_name: "Sally",
  listing_slug: "MFDxSoGZbTDv",
  listing_avatar: "",
  listing_name: "",
  chat_messages_with_senders: [
    {
      id: "bcccff41-7faa-4b4d-9444-c348f42254a5",
      content: "Hi, can I drop around?",
      read_at: null,
      sender_id: "3f801ffe-aa00-402c-8d52-a71674e5e450",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2024-12-27T12:18:46.527046+00:00",
      sender_avatar: "e08bcbf4-68a3-436f-a501-150832b2dbe8.jpg",
      sender_first_name: "Sofie B",
    },
    {
      id: "cac71e0b-1b34-4037-8752-8ce96e32cb06",
      content: "Yo",
      read_at: null,
      sender_id: "3f801ffe-aa00-402c-8d52-a71674e5e450",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2024-12-27T12:22:01.469374+00:00",
      sender_avatar: "e08bcbf4-68a3-436f-a501-150832b2dbe8.jpg",
      sender_first_name: "Sofie B",
    },
    {
      id: "78c6cb63-821f-40a5-baa3-f9f748bd74f9",
      content: "Hi Sally",
      read_at: null,
      sender_id: "3f801ffe-aa00-402c-8d52-a71674e5e450",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2024-12-29T10:54:02.560156+00:00",
      sender_avatar: "e08bcbf4-68a3-436f-a501-150832b2dbe8.jpg",
      sender_first_name: "Sofie B",
    },
    {
      id: "c659741e-6b32-4c7b-b7d1-63bf5ac4aba8",
      content: "Hurra!",
      read_at: null,
      sender_id: "b66e3cac-3466-41dd-aa49-4d8697dc26cb",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2025-01-21T02:28:26.927079+00:00",
      sender_avatar: null,
      sender_first_name: "Sally",
    },
  ],
  listing: {
    name: "",
    slug: "MFDxSoGZbTDv",
    type: "residential",
    visibility: true,
    owner_first_name: "Sally",
  },
  chat_messages: [
    {
      id: "bcccff41-7faa-4b4d-9444-c348f42254a5",
      content: "Hi, can I drop around?",
      read_at: null,
      sender_id: "3f801ffe-aa00-402c-8d52-a71674e5e450",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2024-12-27T12:18:46.527046+00:00",
      sender_avatar: "e08bcbf4-68a3-436f-a501-150832b2dbe8.jpg",
      sender_first_name: "Sofie B",
    },
    {
      id: "cac71e0b-1b34-4037-8752-8ce96e32cb06",
      content: "Yo",
      read_at: null,
      sender_id: "3f801ffe-aa00-402c-8d52-a71674e5e450",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2024-12-27T12:22:01.469374+00:00",
      sender_avatar: "e08bcbf4-68a3-436f-a501-150832b2dbe8.jpg",
      sender_first_name: "Sofie B",
    },
    {
      id: "78c6cb63-821f-40a5-baa3-f9f748bd74f9",
      content: "Hi Sally",
      read_at: null,
      sender_id: "3f801ffe-aa00-402c-8d52-a71674e5e450",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2024-12-29T10:54:02.560156+00:00",
      sender_avatar: "e08bcbf4-68a3-436f-a501-150832b2dbe8.jpg",
      sender_first_name: "Sofie B",
    },
    {
      id: "c659741e-6b32-4c7b-b7d1-63bf5ac4aba8",
      content: "Hurra!",
      read_at: null,
      sender_id: "b66e3cac-3466-41dd-aa49-4d8697dc26cb",
      thread_id: "347f0ff9-d0a3-44d9-8e13-4d66033940a9",
      created_at: "2025-01-21T02:28:26.927079+00:00",
      sender_avatar: null,
      sender_first_name: "Sally",
    },
  ],
};

function PeelsChatDemo() {
  return (
    <ChatDemoContainer>
      <ChatWindow
        user={null}
        listing={demoListing}
        existingThread={existingThread}
        demo={true}
      />
    </ChatDemoContainer>
  );
}

export default PeelsChatDemo;
