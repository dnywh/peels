import SignInButton from "./sign-in-button";
import { Button } from "./ui/button";
import Link from "next/link";

export default function GuestActions() {
  return (
    <div>
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Get started</Link>
      </Button>
      <SignInButton />
    </div>
  );
}