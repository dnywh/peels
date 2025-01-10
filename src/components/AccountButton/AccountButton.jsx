import { createClient } from "@/utils/supabase/server";
import Button from "@/components/Button";

export default async function AccountButton({ children, ...props }) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("first_name")
    .eq("id", user.id)
    .single();

  return user ? (
    <Button href="/profile" variant="secondary" {...props}>
      {profile?.first_name}
    </Button>
  ) : (
    <Button href="/sign-in" variant="secondary" {...props}>
      Sign in
    </Button>
  );
}
