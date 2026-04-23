import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { sharedSurfaceStyles } from "@/styles/commonStyles";
import type { HTMLAttributes, FormHTMLAttributes, ReactNode } from "react";

const nestedFormStyles = css`
  gap: 1rem;
`;

const outerFormStyles = css`
  gap: 2rem;
  ${sharedSurfaceStyles};
  padding: 1.5rem;

  @media (min-width: 768px) {
    background: inherit;
    border: none;
    border-radius: inherit;
    padding: 0;
  }
`;

const sharedFormStyles = css<{ $nested?: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: column;

  ${({ $nested = false }) => ($nested ? nestedFormStyles : outerFormStyles)}
`;

const StyledForm = styled.form<{ $nested?: boolean }>`
  ${sharedFormStyles}
`;

const StyledContainer = styled.section<{ $nested?: boolean }>`
  ${sharedFormStyles}

  & p {
    text-align: center;
    text-wrap: balance;
  }
`;

type FormProps =
  | ({
      as?: "form";
      nested?: boolean;
      children?: ReactNode;
    } & FormHTMLAttributes<HTMLFormElement>)
  | ({
      as: "container";
      nested?: boolean;
      children?: ReactNode;
    } & HTMLAttributes<HTMLElement>);

function Form({ nested = false, as = "form", children, ...props }: FormProps) {
  if (as === "container") {
    return (
      <StyledContainer
        $nested={nested}
        {...(props as HTMLAttributes<HTMLElement>)}
      >
        {children}
      </StyledContainer>
    );
  }

  return (
    <StyledForm
      $nested={nested}
      {...(props as FormHTMLAttributes<HTMLFormElement>)}
    >
      {children}
    </StyledForm>
  );
}

export default Form;
