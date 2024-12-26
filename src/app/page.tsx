// import SignInButton from "@/components/sign-in-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";
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
    <main className="flex-1 flex flex-col gap-6 px-4">
      <h2 className="font-medium text-xl mb-4">
        Find a home for your food scraps,wherever you are.
      </h2>

      <div className="flex items-center gap-4">
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
