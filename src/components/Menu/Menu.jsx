import { Menu as HeadlessMenu } from "@headlessui/react";
import { MenuButton as HeadlessMenuButton } from "@headlessui/react";
import { MenuItem as HeadlessMenuItem } from "@headlessui/react";
import { MenuItems as HeadlessMenuItems } from "@headlessui/react";

const Menu = ({ children, ...props }) => {
  return <HeadlessMenu {...props}>{children}</HeadlessMenu>;
};

Menu.Button = HeadlessMenuButton;
Menu.Items = HeadlessMenuItems;
Menu.Item = HeadlessMenuItem;

export default Menu;
