import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

type TranslationNoticeProps = {
  title: string;
  body: string;
};

export default function TranslationNotice({
  title,
  body,
}: TranslationNoticeProps) {
  return (
    <Container>
      <h3>{title}</h3>
      <p>{body}</p>
    </Container>
  );
}

const Container = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background-color: ${theme.colors.background.sunk};
  padding: 1rem 1.25rem;
  margin: 0 0 2rem;
  border-radius: ${theme.corners.base};
  border: 1px solid ${theme.colors.border.base};
  & h3 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 600;
    color: ${theme.colors.text.ui.secondary};
  }
  & p {
    margin: 0;
    color: ${theme.colors.text.ui.quaternary};
    text-wrap: balance;
  }
`;
