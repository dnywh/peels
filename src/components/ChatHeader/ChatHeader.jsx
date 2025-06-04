import { useRouter } from "next/navigation";
import { Drawer } from "vaul"; // TODO: Import only used subcomponents?
import * as VisuallyHidden from "@radix-ui/react-visually-hidden"; // TODO: Build own version: https://www.joshwcomeau.com/snippets/react-components/visually-hidden/
import { siteConfig } from "@/config/site";
import AvatarPair from "@/components/AvatarPair";
import IconButton from "@/components/IconButton";
import DropdownMenu from "@/components/DropdownMenu";
import Button from "@/components/Button";
import ButtonToDialog from "@/components/ButtonToDialog";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";

import { styled } from "@pigment-css/react";

const StyledChatHeader = styled("header")(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "flexStart", // So top-right IconButton components are hugging the top right corner
  gap: "1rem",
  borderBottom: `1px solid ${theme.colors.border.base}`,
  backgroundColor: theme.colors.background.top,
  padding: "1rem",
}));

const AvatarContainer = styled("div")(({ theme }) => ({
  // display: "none",
  display: "flex",
}));

// Match styling in ListingHeader (but keep separate because of complicated alignment logic here)
const TitleBlock = styled("div")(({ theme }) => ({
  flex: 1,
  alignSelf: "center",

  fontSize: "1rem",

  display: "flex",
  flexDirection: "column",
  alignItems: "stretch",

  "& h1, & p ": {
    // lineHeight: "100%",
  },

  "& h1": {
    fontSize: "1rem",
    lineHeight: "120%",
    color: theme.colors.text.ui.primary,
  },

  "& p": {
    fontSize: "0.875rem",
    lineHeight: "125%",
    color: theme.colors.text.ui.quaternary,
  },

  "@media (min-width: 768px)": {
    "& h1, & h2 ": {
      textAlign: "left",
    },

    "& h1": {
      fontSize: "1.25rem",
    },

    "& p": {
      fontSize: "1rem",
    },
  },
}));

// Style the avatar and title block based on the same conditions as the <- button:
// !isDrawer, and at a certain breakpoint
// We center align the children in this case to account for the left-aligned <- button
const MainContents = styled("div")(({ theme }) => ({
  flex: 1,
  display: "flex",
  flexDirection: "row",
  gap: "1rem",

  [`& ${TitleBlock}`]: {
    textAlign: "left",
  },

  variants: [
    {
      props: { isDrawer: false },
      style: {
        flexDirection: "column",
        alignItems: "center",
        gap: "1rem",

        [`& ${TitleBlock}`]: {
          textAlign: "center",
          gap: 0,
        },

        "@media (min-width: 768px)": {
          flexDirection: "inherit",
          [`& ${TitleBlock}`]: {
            textAlign: "inherit",
            gap: "0.25rem",
          },
        },
      },
    },
  ],
}));

function ChatHeader({ thread, listing, user, isDrawer, isDemo }) {
  const router = useRouter();

  // TODO: Consolidate with other role, naming logic elsewhere
  // Tricky because this ChatHeader component is used for both the existing threads and the new threads, i.e. on the map
  // So we can't always look up details based on thread.
  const role = isDemo
    ? "initiator"
    : thread
      ? thread.initiator_id === user.id
        ? "initiator"
        : "owner"
      : "initiator";

  const otherPersonName =
    role === "initiator"
      ? listing.owner_first_name
      : thread.initiator_first_name;

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
            <Drawer.Title>
              Nested chat drawer title visually hidden TODO
            </Drawer.Title>
            <Drawer.Description>
              Test description for aria visually hidden TODO.
            </Drawer.Description>
          </VisuallyHidden.Root>
        </>
      )}

      <MainContents isDrawer={isDrawer}>
        {/* TODO: Handle breakpoint directly on/in component, not on wrapper div */}
        {/* Handle either listing avatar and owner avatar combo OR initiator's avatar */}
        <AvatarContainer>
          <AvatarPair
            listing={role === "initiator" ? listing : undefined}
            profile={
              role === "owner" ? { avatar: thread.initiator_avatar } : undefined
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
                  View listing
                </Button>
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item>
              <ButtonToDialog
                variant="danger"
                size="small"
                initialButtonText="Report or block"
                dialogTitle="Let’s get this sorted"
                cancelButtonText="Done"
              >
                Sorry to hear you’re having trouble with {otherPersonName}.
                Please{" "}
                <EncodedEmailHyperlink address={siteConfig.email.support}>
                  contact us
                </EncodedEmailHyperlink>{" "}
                to report the issue or to block them from contacting you any
                more.
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
