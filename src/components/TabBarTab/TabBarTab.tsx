import Link from "next/link";
import { css, styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import type { ReactNode } from "react";

const inactiveTabStyles = css`
  &,
  &:visited {
    color: ${theme.colors.tab.inactive};
  }
`;

const activeTabStyles = css`
  &,
  &:visited {
    color: ${theme.colors.tab.active};
  }
`;

const UnreadDot = styled.div`
  position: absolute;
  top: 0px;
  right: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${theme.colors.tab.unread};
  box-shadow: 0 0 0 4px ${theme.colors.background.top};

  @media (min-width: 768px) {
    box-shadow: 0 0 0 4px ${theme.colors.background.sunk};
  }
`;
export default function TabBarTab({
  title,
  href = "/",
  icon = "Icon",
  active = false,
  unreadDot = false,
}: {
  title?: ReactNode;
  href?: string;
  icon?: ReactNode;
  active?: boolean;
  unreadDot?: boolean;
}) {
  return (
    <StyledTabBarTab href={href} $active={active}>
      <StyledTabBarTabIcon>
        {icon}
        {unreadDot && <UnreadDot />}
      </StyledTabBarTabIcon>
      {title && <StyledTabBarTabTitle>{title}</StyledTabBarTabTitle>}
    </StyledTabBarTab>
  );
}

const StyledTabBarTab = styled(Link)<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.05rem;
  height: 100%;
  flex-grow: 1;
  transition:
    opacity 150ms ease-in-out,
    transform 35ms ease-in-out;

  ${({ $active }) => ($active ? activeTabStyles : inactiveTabStyles)}

  &:hover {
    opacity: 0.8;
    transform: scale(0.95);
  }
`;

const StyledTabBarTabTitle = styled.p`
  color: inherit;
  font-size: 0.75rem;
  font-weight: 500;
`;

const StyledTabBarTabIcon = styled.div`
  position: relative;
  color: inherit;

  & svg,
  & svg * {
    color: inherit;
  }
`;
