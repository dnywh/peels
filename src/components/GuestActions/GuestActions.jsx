import ButtonLink from "@/components/ButtonLink";

import SignInButton from "@/components/sign-in-button";
import Button from "@/components/Button";

export default function GuestActions() {
  return (
    <div>
      <ButtonLink href="/sign-up">Get started</ButtonLink>
      <ButtonLink href="/sign-in">Sign in</ButtonLink>
    </div>
  );
}
