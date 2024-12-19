import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { signUpAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";

export default async function Signup(props: {
  searchParams: Promise<{
    error?: string;
    success?: string;
    email?: string;
    first_name?: string;
  }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Redirect authenticated users to profile
  if (user) {
    redirect('/profile');
  }

  const searchParams = await props.searchParams;

  return (
    <>
      <div className="flex flex-col min-w-64 max-w-64 mx-auto">
        <form className="flex flex-col">
          <h1 className="text-2xl font-medium">Sign up</h1>
          <p className="text-sm text text-foreground">
            Already have an account?{" "}
            <Link className="text-primary font-medium underline" href="/sign-in">
              Sign in
            </Link>
          </p>
          <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
            <Label htmlFor="first_name">First name</Label>
            <Input 
              name="first_name" 
              placeholder="Your first name" 
              required 
              defaultValue={searchParams.first_name}
            />
            <Label htmlFor="email">Email</Label>
            <Input 
              type="email" 
              name="email" 
              placeholder="you@example.com" 
              required 
              defaultValue={searchParams.email}
            />
            <Label htmlFor="password">Password</Label>
            <Input
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
            />
            <Label htmlFor="invite_code">Invite code</Label>
            <Input
              name="invite_code"
              placeholder="Your invite code"
              required
            />
            <SubmitButton formAction={signUpAction} pendingText="Signing up...">
              Sign up
            </SubmitButton>
          </div>
        </form>
        <FormMessage message={searchParams} />
      </div>
      <SmtpMessage />
    </>
  );
}
