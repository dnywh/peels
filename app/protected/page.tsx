import FetchDataSteps from "@/components/tutorial/fetch-data-steps";
import { createClient } from "@/utils/supabase/server";
import { InfoIcon } from "lucide-react";
import { redirect } from "next/navigation";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile } = user ? await supabase
    .from("profiles")
    .select("first_name, avatar_url")
    .eq("id", user.id)
    .single() : { data: null };


  // If there's a profile with an avatar_url, get its public URL
  if (profile?.avatar_url) {
    // Extract just the filename from the full URL
    const fileName = profile.avatar_url.split('/').pop();
    
    const { data } = supabase
      .storage
      .from('avatars')
      .getPublicUrl(fileName);
    
    profile.avatar_url = data.publicUrl;
  }


  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <div className="bg-accent text-sm p-3 px-5 rounded-md text-foreground flex gap-3 items-center">
          <InfoIcon size="16" strokeWidth={2} />
          This is a protected page that you can only see as an authenticated
          user, {profile?.first_name}
        </div>
      </div>
      <div className="flex flex-col gap-2 items-start">
        <h2 className="font-bold text-2xl mb-4">Your user details</h2>
        <pre className="text-xs font-mono p-3 rounded border max-h-32 overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
        {profile?.avatar_url && (
  <img 
    src={profile.avatar_url} 
    alt="Profile" 
    className="w-20 h-20 rounded-full mb-2 object-cover"
  />
)}
      </div>
      <div>
        <h2 className="font-bold text-2xl mb-4">Next steps</h2>
        <FetchDataSteps />
      </div>
    </div>
  );
}
