

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // to refresh the page after adding a note
import { deleteAccountAction, signOutAction } from "@/app/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@radix-ui/react-dialog";
import { ThemeSwitcher } from "@/components/theme-switcher";
import GuestActions from "@/components/GuestActions";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ProfilePage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        return (
            <div className="flex-1 w-full flex flex-col gap-12">
                <div className="w-full text-center">
                    <h1 className="text-2xl font-bold mb-4">Profile</h1>
                    <p>Set up a profile or map listing.</p>
                    <GuestActions />
                </div>
            </div>
        );
    }

    const { data: profile } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();


    // More efficient alternative: Join on client side:
    //   const { data: userProfileAndListings, error } = await supabase
    //   .from('profiles')
    //   .select(`
    //     *,
    //     listings: listings (
    //       id,
    //       slug,
    //       type,
    //       name
    //     )
    //   `)
    //   .eq('id', user.id)
    //   .single();

    // if (error) {
    //   console.error("Error fetching user profile and listings:", error);
    // }

    // OR, even better, consider joining the tables on the Supabase side
    // If your application frequently needs data from both tables together, consider restructuring your queries to fetch them in a single request. This can lead to better performance and a more efficient use of resources. However, if the data is rarely needed together or if the tables are large and complex, the current approach may still be valid.


    // Get avatar URL if profile has avatar
    if (profile?.avatar) {
        const {
            data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(profile.avatar);
        profile.avatarUrl = publicUrl; // Add URL to profile object
    }

    async function updateProfile(formData) {
        "use server";

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return redirect("/sign-in");
        }

        let avatar = profile?.avatar;

        // Handle image upload if a file was provided
        const avatarFile = formData.get("avatar");
        if (avatarFile.size > 0) {
            try {
                // Get current profile to check for existing avatar
                const { data: currentProfile } = await supabase
                    .from("profiles")
                    .select("avatar")
                    .eq("id", user.id)
                    .single();

                // Generate new filename
                const fileExt = avatarFile.name.split(".").pop();
                const fileName = `${user.id}-${Math.random()}.${fileExt}`;

                // Delete old avatar if it exists
                if (currentProfile?.avatar) {
                    await supabase.storage
                        .from("avatars")
                        .remove([currentProfile.avatar]);
                }

                // Upload new avatar
                const { error: uploadError } = await supabase.storage
                    .from("avatars")
                    .upload(fileName, avatarFile);

                if (uploadError) throw uploadError;

                // Store just the filename
                avatar = fileName;
            } catch (error) {
                console.error("Avatar update failed:", error);
                throw error;
            }
        }

        // Update profile
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                avatar,
                first_name: formData.get("first_name")?.toString(),
                favorite_color: formData.get("favorite_color")?.toString(),
                suburb: formData.get("suburb")?.toString(),
            })
            .eq("id", user.id);

        if (updateError) throw updateError;

        revalidatePath("/profile");
        redirect("/profile");
    }

    return (
        <div className="max-w-md mx-auto mt-8">
            <Link href="/profile">Back to profile (only shown on mobile)</Link>
            <h1 className="text-2xl mb-4">Account</h1>

            <div className="mb-8">
                <h2 className="text-lg mb-2">Preferences</h2>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                    <span>Theme</span>
                    <ThemeSwitcher />
                </div>
            </div>

            <p>{user.email}</p>






            <hr />

            <form action={updateProfile}>
                <div>
                    <label>Profile Picture</label>
                    {profile?.avatar && (
                        <img
                            src={profile.avatarUrl}
                            alt="Profile"
                            style={{ width: "100px" }}
                        />
                    )}
                    <input
                        type="file"
                        name="avatar"
                        accept="image/*"
                        className="border p-2 w-full"
                    />
                </div>

                <div>
                    <label>First Name</label>
                    <input
                        type="text"
                        name="first_name"
                        defaultValue={profile?.first_name || ""}
                        className="border p-2 w-full"
                    />
                </div>

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

                >
                    Save Profile
                </button>
            </form>

            <form action={signOutAction}>
                <Button type="submit" variant={"outline"}>
                    Sign out
                </Button>
            </form>

            <hr />




            <Dialog>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                    >
                        Delete Account
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Delete Account</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete your account? This action cannot be
                        undone.
                    </DialogDescription>
                    <div className="mt-4 flex gap-4">
                        <form action={deleteAccountAction}>
                            <button
                                type="submit"
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Yes, Delete My Account
                            </button>
                        </form>
                        <DialogClose asChild>
                            <button type="button" className="bg-gray-200 px-4 py-2 rounded">
                                Cancel
                            </button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
