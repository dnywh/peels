import { createClient } from "@/utils/supabase/server";
import Link from "next/link";

export default async function ChatsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex-1 w-full flex flex-col gap-12">
        <div className="w-full text-center">
          <h1 className="text-2xl font-bold mb-4">Messages</h1>
          <p>Please <Link href="/sign-in" className="text-primary hover:underline">sign in</Link> to view your messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full flex flex-col gap-12">
      <div className="w-full">
        <h1 className="text-2xl font-bold mb-4">Your Messages</h1>
        {/* Chat interface will go here */}
        <p>Logged in user.</p>
      </div>
    </div>
  );
} 
