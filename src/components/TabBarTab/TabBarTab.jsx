import Link from "next/link";
import { styled } from "@pigment-css/react";

export default function TabBarTab({
  title = "Tab",
  href = "/",
  icon = "Icon",
  active = false,
}) {
  return (
    <StyledTabBarTab href={href}>
      <StyledTabBarTabIcon active={active}>{icon}</StyledTabBarTabIcon>
      <StyledTabBarTabTitle active={active}>{title}</StyledTabBarTabTitle>
    </StyledTabBarTab>
  );
}

const StyledTabBarTab = styled(Link)({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "0.05rem",
  // padding: "1rem",
  flexGrow: 1,
});

const StyledTabBarTabTitle = styled("p")({
  fontSize: "0.85rem",
  fontWeight: "550",
  color: "black",
  variants: [
    {
      props: { active: true },
      style: {
        color: "red",
      },
    },
  ],
});

const StyledTabBarTabIcon = styled("p")({
  color: "black",
  variants: [
    {
      props: { active: true },
      style: {
        color: "red",
      },
    },
  ],
});
