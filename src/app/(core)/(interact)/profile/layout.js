import ProfileData from '@/components/ProfileData';
import Link from 'next/link';

import NavLinks from './nav-links';
import ProfileRedirect from './profile-redirect';
import BackButton from '@/components/BackButton';
import { signOutAction } from "@/app/actions";
import SubmitButton from '@/components/SubmitButton';
import AvatarRead from '@/components/AvatarRead';
import LegalFooter from '@/components/LegalFooter';
import { styled } from "@pigment-css/react";

const MobileBackButton = styled(BackButton)({
    display: "block",
    '@media (min-width: 768px)': {
        display: "none",
    },
});

const ProfilePageLayout = styled("div")({
    display: "flex",

    flexDirection: "column",
    // alignItems: "stretch",
    gap: "2rem",
    '@media (min-width: 768px)': {
        flexDirection: "row",
    },
});

const ProfileSidebarContainer = styled("div")({
    // display: "none",
    // '@media (min-width: 768px)': {
    //     display: "block",
    // },
});

const ProfileSidebar = styled("div")({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "2rem",
    width: "16rem",
    // backgroundColor: "tomato",
    '@media (min-width: 768px)': {
        position: "sticky",
        top: 0,
        border: "1px solid grey",
    },
});

export default function ProfileLayout({ children }) {
    // console.log("children", children);
    return (
        <div>
            <ProfileRedirect />

            <ProfilePageLayout>

                {/* TODO: This sidebar should be hidden via CSS on smaller breakpoint IF on a subpage */}
                <ProfileSidebarContainer>
                    <ProfileSidebar>

                        <AvatarRead />

                        <h2>Settings</h2>
                        <NavLinks />

                        <ProfileData />


                        <form action={signOutAction}>
                            <SubmitButton>Sign out</SubmitButton>
                        </form>

                        <LegalFooter />
                    </ProfileSidebar>
                </ProfileSidebarContainer>

                {/* Main page content if relevant. Only renders if children */}
                {children &&
                    <main>
                        <MobileBackButton />
                        {children}
                    </main>}

            </ProfilePageLayout>
        </div>
    );
}

