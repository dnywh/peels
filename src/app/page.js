// import SignInButton from "@/components/sign-in-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
// import { createClient } from "@/utils/supabase/server";
import PeelsButton from "@/components/PeelsButton";
import TestButton from "@/components/TestButton";
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
    <main>
      <h2>Find a home for your food scraps,wherever you are.</h2>
      <PeelsButton>PeelsButton</PeelsButton>
      <TestButton variant="contained" color="primary">
        Submit
      </TestButton>
      <TestButton variant="contained" color="secondary">
        Other
      </TestButton>
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
    </main>
  );
}
