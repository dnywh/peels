

import { styled } from "@pigment-css/react";

const ProfilePageLayout = styled("main")({
    flex: 1, // Should be shared with layout used by Profile and Listings pages
    margin: "2rem auto", // Should be shared with layout used by Profile and Listings pages
    maxWidth: "640px",  // Might be shared with layout used by Profile and Listings pages, depending if the latter is two columns on larger breakpoints

    display: "flex",
    flexDirection: "column",
    gap: "3rem",

});


export default function ProfileLayout({ children }) {
    return (
        <ProfilePageLayout>
            {children}
        </ProfilePageLayout>
    );
}

