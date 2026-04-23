import { useRouter } from "next/navigation";
import { Drawer } from "vaul"; // TODO: Import only used subcomponents?
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
import { siteConfig } from "@/config/site";
import AvatarPair from "@/components/AvatarPair";
import IconButton from "@/components/IconButton";
import DropdownMenu from "@/components/DropdownMenu";
import Button from "@/components/Button";
import ButtonToDialog from "@/components/ButtonToDialog";
import EncodedEmailLink from "@/components/EncodedEmailLink";

import { styled } from "next-yak";
import { theme } from "@/styles/theme.yak";
import { useTranslations } from "next-intl";
import type { ReactNode } from "react";

const StyledChatHeader = styled.header`
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid ${theme.colors.border.base};
  background-color: ${theme.colors.background.top};
  padding: 1rem;
`;

const AvatarContainer = styled.div`
  display: flex;
`;

// Match styling in ListingHeader (but keep separate because of complicated alignment logic here)
const TitleBlock = styled.div`
  flex: 1;
  align-self: center;
  font-size: 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;

  & h1 {
    font-size: 1rem;
    line-height: 120%;
    color: ${theme.colors.text.ui.primary};
  }

  & p {
    font-size: 0.875rem;
    line-height: 125%;
    color: ${theme.colors.text.ui.quaternary};
  }

  @media (min-width: 768px) {
    & h1,
    & h2 {
      text-align: left;
    }

    & h1 {
      font-size: 1.25rem;
    }

    & p {
      font-size: 1rem;
    }
  }
`;

// Style the avatar and title block based on the same conditions as the <- button:
// !isDrawer, and at a certain breakpoint
// We center align the children in this case to account for the left-aligned <- button
const MainContents = styled.div<{ $isDrawer?: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: row;
  gap: 1rem;

  & ${TitleBlock} {
    text-align: left;
  }

  ${({ $isDrawer }) =>
    $isDrawer === false &&
    `
      flex-direction: column;
      align-items: center;
      gap: 1rem;

      & ${TitleBlock} {
        text-align: center;
        gap: 0;
      }

      @media (min-width: 768px) {
        flex-direction: inherit;

        & ${TitleBlock} {
          text-align: inherit;
          gap: 0.25rem;
        }
      }
    `}
`;

type ChatHeaderProps = {
  thread?: {
    initiator_id?: string;
    initiator_first_name?: string;
    initiator_avatar?: string | null;
  } | null;
  listing: {
    owner_first_name?: string;
    type?: string;
    area_name?: string;
    name?: string;
    slug?: string;
  };
  user?: { id?: string } | null;
  isDrawer?: boolean;
  isDemo?: boolean;
};

function ChatHeader({
  thread,
  listing,
  user,
  isDrawer = false,
  isDemo = false,
}: ChatHeaderProps) {
  const t = useTranslations();
  const router = useRouter();

  // TODO: Consolidate with other role, naming logic elsewhere
  // Tricky because this ChatHeader component is used for both the existing threads and the new threads, i.e. on the map
  // So we can't always look up details based on thread.
  const role = isDemo
    ? "initiator"
    : thread
      ? thread.initiator_id === user?.id
        ? "initiator"
        : "owner"
      : "initiator";

  const otherPersonName =
    role === "initiator"
      ? listing.owner_first_name || ""
      : thread?.initiator_first_name || "";

  return (
    <StyledChatHeader>
      {!isDrawer && !isDemo && (
        <IconButton
          breakpoint="sm"
          icon="back"
          onClick={() => router.push("/chats")}
        />
      )}
      {isDrawer && (
        <>
          <VisuallyHidden.Root>
            <Drawer.Title>{t("Chat.drawerTitle")}</Drawer.Title>
            <Drawer.Description>
              {t("Chat.drawerDescription")}
            </Drawer.Description>
          </VisuallyHidden.Root>
        </>
      )}

      <MainContents $isDrawer={isDrawer}>
        {/* TODO: Handle breakpoint directly on/in component, not on wrapper div */}
        {/* Handle either listing avatar and owner avatar combo OR initiator's avatar */}
        <AvatarContainer>
          <AvatarPair
            listing={role === "initiator" ? listing : undefined}
            profile={
              role === "owner"
                ? { avatar: thread?.initiator_avatar }
                : undefined
            }
            user={user}
            smallest="small"
            role={role}
          />
        </AvatarContainer>

        <TitleBlock>
          {/* TODO: the below should  be flexible enough to show 'Mary, Ferndale Community Garden' (community or business listing), 'Mary' (residential listing)  */}
          {/* TODO: Extract and have a 'otherPersonName' const and a more malleable 'recipient and their listing name' as per above */}
          <h1>{otherPersonName}</h1>
          {role === "initiator" && (
            <p>
              {listing.type === "residential"
                ? `Resident of ${listing.area_name}`
                : listing.name}
            </p>
          )}
        </TitleBlock>
      </MainContents>

      {!isDrawer && !isDemo && (
        <DropdownMenu.Root>
          <DropdownMenu.Button as={IconButton} icon="overflow" />

          <DropdownMenu.Items anchor={{ to: "bottom end", gap: "4px" }}>
            {role === "initiator" && (
              <DropdownMenu.Item>
                <Button
                  onClick={() => router.push(`/listings/${listing.slug}`)}
                  variant="secondary"
                  size="small"
                >
                  {t("Actions.viewListing")}
                </Button>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item>
              <ButtonToDialog
                variant="danger"
                size="small"
                initialButtonText={t("Chat.report")}
                dialogTitle={t("Chat.reportTitle")}
                cancelButtonText={t("Actions.done")}
              >
                {t.rich("Chat.reportBody", {
                  name: otherPersonName,
                  link: (chunks: ReactNode) => (
                    <EncodedEmailLink address={siteConfig.encodedEmail.support}>
                      {chunks}
                    </EncodedEmailLink>
                  ),
                })}
              </ButtonToDialog>
            </DropdownMenu.Item>
          </DropdownMenu.Items>
        </DropdownMenu.Root>
      )}

      {isDrawer && (
        <Drawer.Close asChild>
          <IconButton icon="close" />
        </Drawer.Close>
      )}
    </StyledChatHeader>
  );
}

export default ChatHeader;
