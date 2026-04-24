type DemoThread = {
  id: string;
  chat_messages_with_senders: Array<{
    id: string;
    content: string;
    created_at: string;
    read_at: string | null;
    sender_id: string | null;
    thread_id: string | null;
  }>;
};

const timestampThree = new Date();
timestampThree.setHours(9, 2, 0, 0);

const timestampTwo = new Date(timestampThree);
timestampTwo.setHours(6, 48, 0, 0);

const timestampOne = new Date(timestampThree);
timestampOne.setDate(timestampThree.getDate() - 1);
timestampOne.setHours(20, 10, 0, 0);

export const demoThreads: DemoThread[] = [
  {
    id: "demo-thread-1",
    chat_messages_with_senders: [
      {
        id: "demo-thread-1-message-1",
        content: "Hey Becca, are you still accepting food scraps?",
        created_at: timestampOne.toISOString(),
        read_at: timestampOne.toISOString(),
        sender_id: "demo-initiator",
        thread_id: "demo-thread-1",
      },
      {
        id: "demo-thread-1-message-2",
        content:
          "Yes please! We’re home most days after 4pm. Ring the bell at 12 Ingham Dr",
        created_at: timestampTwo.toISOString(),
        read_at: timestampTwo.toISOString(),
        sender_id: "demo-owner",
        thread_id: "demo-thread-1",
      },
    ],
  },
];
