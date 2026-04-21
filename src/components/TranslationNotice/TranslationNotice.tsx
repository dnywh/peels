import { styled } from "@pigment-css/react";

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

const Container = styled("aside")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  backgroundColor: theme.colors.background.sunk,
  padding: "1rem 1.25rem",
  margin: "0 0 2rem",
  borderRadius: theme.corners.base,
  border: `1px solid ${theme.colors.border.base}`,

  "& h3": {
    margin: 0,
    fontSize: "0.875rem",
    fontWeight: 600,
    color: theme.colors.text.ui.secondary,
  },

  "& p": {
    margin: 0,
    color: theme.colors.text.ui.quaternary,
    textWrap: "balance",
  },
}));
