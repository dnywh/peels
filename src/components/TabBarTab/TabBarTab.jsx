import Link from "next/link";
import { styled } from "@pigment-css/react";

const UnreadDot = styled("div")(({ theme }) => ({
  position: "absolute",
  top: "0px",
  right: "-4px",
  width: "10px",
  height: "10px",
  borderRadius: "50%",
  backgroundColor: theme.colors.tab.unread,
  boxShadow: `0 0 0 4px ${theme.colors.background.top}`,
  "@media (min-width: 768px)": {
    boxShadow: `0 0 0 4px ${theme.colors.background.sunk}`,
  },
}));
export default function TabBarTab({
  title,
  href = "/",
  icon = "Icon",
  active = false,
  unreadDot = false,
}) {
  return (
    <StyledTabBarTab href={href}>
      <StyledTabBarTabIcon active={active}>
        {icon}
        {unreadDot && <UnreadDot />}
      </StyledTabBarTabIcon>
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
  height: "100%",
  flexGrow: 1,
  color: theme.colors.tab.inactive,

  transition: "opacity 150ms ease-in-out, transform 35ms ease-in-out",

  "&:hover": {
    opacity: 0.8,
    transform: "scale(0.95)",
  },
}));

const StyledTabBarTabTitle = styled("p")(({ theme }) => ({
  fontSize: "0.75rem",
  fontWeight: "500",

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
  position: "relative",
  variants: [
    {
      props: { active: true },
      style: {
        color: theme.colors.tab.active,
      },
    },
  ],
}));
