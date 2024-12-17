import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // to refresh the page after adding a note

export default async function ProfilePage() {
  const supabase = await createClient();
  
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select()
    .eq('id', user.id)
    .single();

  async function updateProfile(formData: FormData) {
    'use server';
    
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    const first_name = formData.get('first_name')?.toString();
    const suburb = formData.get('suburb')?.toString();
    const favorite_color = formData.get('favorite_color')?.toString();

    await supabase
      .from('profiles')
      .upsert({ 
        id: user.id, 
        first_name, 
        suburb, 
        favorite_color 
      })
      .eq('id', user.id);

    revalidatePath('/profile');
    revalidatePath('/notes');
    redirect("/protected")
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl mb-4">Edit Profile</h1>
      <form action={updateProfile}>
        <div className="mb-4">
          <label className="block mb-2">First Name</label>
          <input
            type="text"
            name="first_name"
            defaultValue={profile?.first_name || ''}
            className="border p-2 w-full"
          />
        </div>
        {/* Add more fields as needed */}
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Profile
        </button>
      </form>
    </div>
  );
} 