import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // to refresh the page after adding a note
import { deleteAccountAction } from "@/app/actions";

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
    .eq("id", user.id)
    .single();

  async function updateProfile(formData: FormData) {
    "use server";

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return redirect("/sign-in");
    }

    let avatar_url = profile?.avatar_url;

    // Handle image upload if a file was provided
    const avatarFile = formData.get("avatar") as File;
    if (avatarFile.size > 0) {
      try {
        // Get current profile to check for existing avatar
        const { data: currentProfile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        // Generate new filename
        const fileExt = avatarFile.name.split(".").pop();
        const fileName = `${user.id}-${Math.random()}.${fileExt}`;

        // Delete old avatar if it exists
        // Has to be done this way because upsert doesn't play nice for some reason (TODO)
        if (currentProfile?.avatar_url) {
          const oldFileName = currentProfile.avatar_url.split("/").pop();
          await supabase.storage.from("avatars").remove([oldFileName]);
        }

        // Upload new avatar
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(fileName, avatarFile);

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(fileName);

        avatar_url = publicUrl;
      } catch (error) {
        console.error("Avatar update failed:", error);
        throw error;
      }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        avatar_url,
        first_name: formData.get("first_name")?.toString(),
        favorite_color: formData.get("favorite_color")?.toString(),
        suburb: formData.get("suburb")?.toString(),
      })
      .eq("id", user.id);

    if (updateError) throw updateError;

    revalidatePath("/profile");
    revalidatePath("/protected");
    redirect("/protected");
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl mb-4">Edit Profile</h1>
      <form action={updateProfile}>
        {/* Add avatar upload input */}
        <div className="mb-4">
          <label className="block mb-2">Profile Picture</label>
          {profile?.avatar_url && (
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-20 h-20 rounded-full mb-2 object-cover"
            />
          )}
          <input
            type="file"
            name="avatar"
            accept="image/*"
            className="border p-2 w-full"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">First Name</label>
          <input
            type="text"
            name="first_name"
            defaultValue={profile?.first_name || ""}
            className="border p-2 w-full"
          />
        </div>
        {/* Add more fields as needed */}
        <div className="mb-4">
          <label className="block mb-2">Favourite colour</label>
          <input
            type="text"
            name="favorite_color"
            defaultValue={profile?.favorite_color || ""}
            className="border p-2 w-full"
          />
        </div>
        <div className="mb-4">
          <label className="block mb-2">Suburb</label>
          <input
            type="text"
            name="suburb"
            defaultValue={profile?.suburb || ""}
            className="border p-2 w-full"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Save Profile
        </button>
      </form>
      <form action={deleteAccountAction} className="mt-4">
        <button
          type="submit"
          className="bg-red-500 text-white px-4 py-2 rounded"
        >
          Delete Account
        </button>
      </form>
    </div>
  );
}
