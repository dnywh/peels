// import SignInButton from "@/components/sign-in-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { styled } from "@pigment-css/react";

const StyledMain = styled("main")({
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "1.5rem",
  marginTop: "30dvh",
  // height: "100dvh",
});

// import { createClient } from "@/utils/supabase/server";
export default async function Index() {
  // const supabase = await createClient();

  // const {
  //   data: { user },
  // } = await supabase.auth.getUser();

  // const { data: profile } = user ? await supabase
  //   .from("profiles")
  //   .select("first_name")
  //   .eq("id", user.id)
  //   .single() : { data: null };

  return (
    <StyledMain>
      <h2>Find a home for your food scraps, wherever you are.</h2>
      <div>
        <Button asChild size="lg" variant={"default"}>
          <Link href="/map">Browse the map</Link>
        </Button>
        <Button asChild size="lg" variant={"outline"}>
          {/* TODO: {user ? <Link href="/profile#TODO-listing-form-for-signed-in-users">Create a listing</Link> : <Link href="/sign-up">Sign up</Link>} */}
          <Link href="/sign-up">Sign up</Link>
        </Button>
      </div>

      {/* TODO: {!user && <Link href="/profile#TODO-listing-paramters-for-guest-users-to-eventually-come-back-to-via-a-callback-url">Create a map listing</Link>} */}
    </StyledMain>
  );
}
