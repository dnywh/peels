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
import type { ChatListing, ChatThreadRecord, ChatUser } from "@/types/chat";

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
  thread?: ChatThreadRecord | null;
  listing: ChatListing;
  user?: ChatUser | null;
  isDrawer?: boolean;
  isDemo?: boolean;
};

type ChatRole = "initiator" | "owner";

function getChatRole(
  thread: ChatThreadRecord | null | undefined,
  user: ChatUser | null | undefined,
  isDemo: boolean
): ChatRole {
  if (isDemo) {
    return "initiator";
  }

  if (thread?.initiator_id && thread.initiator_id === user?.id) {
    return "initiator";
  }

  return "owner";
}

function getListingSummary(
  listing: ChatListing,
  role: ChatRole,
  t: ReturnType<typeof useTranslations>
) {
  if (role !== "initiator") {
    return null;
  }

  if (listing.type === "residential") {
    return listing.area_name
      ? t("Listings.read.residentOf", { area: listing.area_name })
      : t("Listings.read.localResident");
  }

  return listing.name ?? null;
}

function ChatHeader({
  thread,
  listing,
  user,
  isDrawer = false,
  isDemo = false,
}: ChatHeaderProps) {
  const t = useTranslations();
  const router = useRouter();

  const role = getChatRole(thread, user, isDemo);

  const otherPersonName =
    role === "initiator"
      ? listing.owner_first_name || ""
      : thread?.initiator_first_name || "";
  const listingSummary = getListingSummary(listing, role, t);

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
        {/* Handle either listing avatar and owner avatar combo OR initiator's avatar */}
        <AvatarContainer>
          <AvatarPair
            listing={
              role === "initiator"
                ? {
                    type: listing.type ?? undefined,
                    avatar: listing.avatar,
                    owner_avatar: listing.owner_avatar,
                  }
                : undefined
            }
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
          <h1>{otherPersonName}</h1>
          {listingSummary && <p>{listingSummary}</p>}
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
