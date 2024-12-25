import { createClient } from "@/utils/supabase/server";
import MapPageClient from "@/components/MapPageClient";

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();


  return (
    <div>
      {user ? (
        <p>Hello {user.email}</p>
      ) : (
        <p>Hello Guest</p>
      )}
      <MapPageClient user={user} />
    </div>
  );
}
