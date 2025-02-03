const timestampThree = new Date();
timestampThree.setHours(9, 2, 0, 0);

const timestampTwo = new Date(timestampThree);
timestampTwo.setDate(timestampThree.getDate());
timestampTwo.setHours(6, 48, 0, 0);

const timestampOne = new Date(timestampThree);
timestampOne.setDate(timestampThree.getDate() - 1);
timestampOne.setHours(20, 10, 0, 0);


export const demoThreads = [
    {
        chat_messages_with_senders: [
            {
                content: "Hey Becca, are you still accepting food scraps?",
                created_at: timestampOne.toISOString(),
            },
            {
                content:
                    "Yes please! We’re home most days after 4pm. Ring the bell at 12 Ingham Dr",
                created_at: timestampTwo.toISOString(),
            },
            // {
            //     content: "Amazing! Thank you, I'll try this afternoon 🙂",
            //     created_at: timestampThree.toISOString(),
            // },
        ],
    },
];
