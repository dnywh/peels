import Link from "next/link";
import { styled } from "@pigment-css/react";

// const StyledTabBarNav = styled("nav")(({ theme }) => ({
const Hyperlink = styled(Link)(({ theme }) => ({
  color: theme.colors.text.primary,
  fontWeight: "500",
  textDecoration: "underline",
  transition: "opacity 150ms ease-in-out",
  "&:hover": {
    opacity: 0.65,
  },
}));

export default Hyperlink;
