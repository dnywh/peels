import { signOutAction } from "@/app/actions";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import SignInButton from './sign-in-button';

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  
  const { data: profile } = user ? await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single() : { data: null };

  return user ? (
    <div className="flex items-center gap-4">
      <Link href="/profile">Hey, {profile?.first_name || user.email}!</Link>
      <form action={signOutAction}>
        <Button type="submit" variant={"outline"}>
          Sign out
        </Button>
      </form>
    </div>
  ) : (
    <div className="flex gap-2">
      <SignInButton />
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Sign up</Link>
      </Button>
    </div>
  );
}
