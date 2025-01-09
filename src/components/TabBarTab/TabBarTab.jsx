import Link from "next/link";
import { styled } from "@pigment-css/react";

export default function TabBarTab({
  title,
  href = "/",
  icon = "Icon",
  active = false,
}) {
  return (
    <StyledTabBarTab href={href}>
      <StyledTabBarTabIcon active={active}>{icon}</StyledTabBarTabIcon>
      {title && (
        <StyledTabBarTabTitle active={active}>{title}</StyledTabBarTabTitle>
      )}
    </StyledTabBarTab>
  );
}

const StyledTabBarTab = styled(Link)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.05rem",
  // padding: "1rem",
  flexGrow: 1,
  color: theme.colors.tab.inactive,
}));

const StyledTabBarTabTitle = styled("p")(({ theme }) => ({
  fontSize: "0.85rem",
  fontWeight: "550",

  variants: [
    {
      props: { active: true },
      style: {
        color: theme.colors.tab.active,
      },
    },
  ],
}));

const StyledTabBarTabIcon = styled("div")(({ theme }) => ({
  variants: [
    {
      props: { active: true },
      style: {
        color: theme.colors.tab.active,
      },
    },
  ],
}));
