import { styled } from "@pigment-css/react";

const StyledFormMessage = styled("aside")<{
  variant?: "error" | "success" | undefined;
}>(({ theme }) => ({
  width: "100%",
  // flex: 1,
  padding: "1.5rem 2rem",
  borderRadius: theme.corners.base,
  background: theme.colors.background.pit,

  variants: [
    {
      props: { variant: "success" },
      style: {
        textWrap: "balance",
        textAlign: "center",
      },
    },
  ],
}));

export type Message = {
  error?: string;
  success?: string;
};

export default function FormMessage({ message }: { message: Message }) {
  return (
    <StyledFormMessage variant={"success" in message ? "success" : "error"}>
      {"success" in message && <p>{message.success}</p>}
      {"error" in message && <p>{message.error}</p>}
    </StyledFormMessage>
  );
}
