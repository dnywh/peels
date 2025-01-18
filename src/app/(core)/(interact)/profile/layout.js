

import { styled } from "@pigment-css/react";

const ProfilePageLayout = styled("main")({
    display: "flex",
    flexDirection: "column",
    gap: "1.5rem",
    //   width: "100%",
    // flex: 1,

    // maxWidth: "960px", // Should be applied to children (perhaps as a wrapper) and shared with Listings page

});

// const ProfileMain = styled("main")(({ theme }) => ({
//     // border: `1px solid ${theme.colors.border.base}`,
//     // borderRadius: theme.corners.base,
//     // backgroundColor: theme.colors.background.top,

//     // padding: `calc(${theme.spacing.unit} * 3)`,

//     width: "100%",

//     "@media (min-width: 768px)": {
//       maxWidth: "40rem",
//     },
//   }));



export default function ProfileLayout({ children }) {
    return (
        <ProfilePageLayout>
            {children}
        </ProfilePageLayout>
    );
}

