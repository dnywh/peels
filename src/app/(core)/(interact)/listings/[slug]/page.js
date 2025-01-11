import { createClient } from "@/utils/supabase/server";
import { notFound } from 'next/navigation'

import ListingRead from "@/components/ListingRead";

import { styled } from "@pigment-css/react";

const StyledMain = styled("main")({
    display: "flex",
    flexDirection: "column",
    gap: "3rem",
    margin: "4rem auto",
    maxWidth: "640px",

    "& > section": {
        // backgroundColor: "red",
    },

    "@media (min-width: 768px)": {
        "& > *": {
            marginLeft: "-4.25rem", // TODO: Set tab bar as floating on this page instead, or (failing that) make this offset dynamic based on desktop tab bar width
        },
    },
});

export default async function Post({ params }) {
    const supabase = await createClient();
    // Get current user's info
    const { data: { user } } = await supabase.auth.getUser();

    // Generate pages
    const { slug } = await params;  // Awaiting params to access slug

    const { data } = await supabase
        .from('listings')
        .select(
            `
            *,
            profiles (
              first_name,
              avatar
            )
          `
        )
        .match({ slug })  // Use slug to match the listing
        .single()

    if (!data) {
        notFound()
    }

    return (
        <StyledMain>
            <ListingRead user={user} listing={data} />
        </StyledMain>
    )
}
