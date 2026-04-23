import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";

const StyledMenuItems = styled(MenuItems)`
  width: auto;
  origin: top center;
  background: ${theme.colors.background.top};
  padding: 0.5rem;
  border-radius: ${theme.corners.base};
  transition:
    opacity 100ms ease-out,
    scale 100ms ease-out;
  transform-origin: top center;
  display: flex;
  flex-direction: column;
  gap: calc(${theme.spacing.unit} * 1);
  box-shadow: 0px 0px 3px 1px rgba(0, 0, 0, 0.06);
  &[data-closed] {
    scale: 0.95;
    opacity: 0;
  }
`;

// Re-export the base components, either from their styled components or from the headless components
const Root = Menu;
const Button = MenuButton;
const Item = MenuItem;
const Items = StyledMenuItems;

// Create a compound component by adding the sub-components as properties
const DropdownMenu = {
  Root,
  Button,
  Item,
  Items,
};

export default DropdownMenu;
