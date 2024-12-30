import SignInButton from "@/components/sign-in-button";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GuestActions() {
  return (
    <div>
      Guest Actions Here
      <Button asChild size="sm" variant={"default"}>
        <Link href="/sign-up">Get started</Link>
      </Button>
      <SignInButton />
    </div>
  );
}
