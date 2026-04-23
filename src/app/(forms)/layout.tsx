import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

const AuthPage = styled.main`
  margin: 0.5rem auto;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: ${theme.spacing.forms.maxWidth};
  @media (min-width: 768px) {
    margin: 3rem auto;
    padding: 1.5rem;
    background: ${theme.colors.background.top};
    border: 1px solid ${theme.colors.border.base};
    border-radius: ${theme.corners.base};
  }
`;

export default async function Layout({ children }: { children: ReactNode }) {
  return <AuthPage>{children}</AuthPage>;
}
