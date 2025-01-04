import Link from "next/link";
import { styled } from "@pigment-css/react";

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
});

function TabBarTab({ title = "Tab", href = "/", icon = "Icon" }) {
  return (
    <StyledTabBarTab href={href}>
      <p>{icon}</p>
      <StyledTabBarTabTitle>{title}</StyledTabBarTabTitle>
    </StyledTabBarTab>
  );
}

export default TabBarTab;
