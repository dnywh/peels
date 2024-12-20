import GuestActions from "@/components/guest-actions";
import TestTwo from "@/components/TestTwo";
import { createClient } from "@/utils/supabase/server";

export default async function MapPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <TestTwo></TestTwo>
        {user ? (
          <div>Map interface for logged in users</div>
        ) : (
          <div>
            <h1>Discover People Near You</h1>
            <p>Sign in to connect with people in your area</p>

            <GuestActions />
          </div>
        )}
      </div>
    </div>
  );
}
