import { styled } from "@pigment-css/react";

// export interface EmailAsideProps {
//   title: string;
//   children: ReactNode;
// }

function StaticPageHeader({ title, subtitle, parent }: { title: any; subtitle: any; parent?: any; }) {
  return (
    <Header>
      {parent && <a href="./">{parent}</a>}
      <h1>{title}</h1>
      {subtitle && <p>{subtitle}</p>}
    </Header>
  );
}

export default StaticPageHeader;

const Header = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  maxWidth: "640px",

  textAlign: "center",
  textWrap: "balance",

  "& h1": {
    fontSize: "2.5rem",
    color: theme.colors.text.primary,
  },

  "& p": {
    fontSize: "1.25rem",
    color: theme.colors.text.tertiary,
  },
}));
