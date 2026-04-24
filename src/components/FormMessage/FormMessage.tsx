import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

const successMessageStyles = css`
  text-wrap: balance;
  text-align: center;
`;

const errorMessageStyles = css`
  background: ${theme.colors.background.error};
  color: ${theme.colors.button.danger.text};
`;

const StyledFormMessage = styled.aside<{ $variant?: "error" | "success" }>`
  width: 100%;
  padding: 1.5rem 2rem;
  border-radius: ${theme.corners.base};
  background: ${theme.colors.background.pit};

  p {
    margin: 0;
  }

  ${({ $variant }) => $variant === "error" && errorMessageStyles}
  ${({ $variant }) => $variant === "success" && successMessageStyles}
`;

export type Message = {
  error?: string | React.ReactNode;
  success?: string | React.ReactNode;
};

export default function FormMessage({ message }: { message: Message }) {
  return (
    <StyledFormMessage $variant={"success" in message ? "success" : "error"}>
      {"success" in message && <p>{message.success}</p>}
      {"error" in message && <p>{message.error}</p>}
    </StyledFormMessage>
  );
}
