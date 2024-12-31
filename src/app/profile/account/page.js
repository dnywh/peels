

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // to refresh the page after adding a note
import { deleteAccountAction, updateEmailAction, sendPasswordResetEmailAction } from "@/app/actions";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
    DialogTrigger,
    DialogClose,
} from "@radix-ui/react-dialog";

import Link from "next/link";

export default async function ProfilePage({ searchParams }) {

    const message = (await searchParams)?.message
    const error = (await searchParams)?.error
    console.log(message, error);

    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    const { data: profile } = await supabase
        .from("profiles")
        .select()
        .eq("id", user.id)
        .single();

    const { data: listings } = await supabase
        .from("listings")
        .select()
        .eq("owner_id", user.id)


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

        console.log("formData", formData);

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

        // Handle email change
        if (formData.get("email_change") !== user.email) {
            console.log("email different, trigger change");
            const { data, error } = await supabase.auth.updateUser({
                email: formData.get("email_change")
            })
        }

        // Handle password change
        // TODO: very against current password via RPC or send an email instead
        if (formData.get("password_change") !== user.password) {
            console.log("password different, trigger change");
            const { data, error } = await supabase.auth.updateUser({
                password: formData.get("password_change")
            })
        }



        if (updateError) throw updateError;

        // revalidatePath("/profile");
        // redirect("/profile");
    }

    // async function resetPassword(formData) {
    //     // const { data, error } = await supabase.auth
    //     //     .resetPasswordForEmail(user.email)

    //     // if (error) throw error;

    //     console.log("Password reset email sent to", user.email);
    // }


    return (
        <div>
            {/* TODO: Show these search param at both profile and profile/account, depending on which is routed to*/}
            {message && <p>Message: {message}</p>}
            {error && <p>Error: {error}</p>}

            <Link href="/profile">Back to profile (only shown on mobile)</Link>
            <h1>Account</h1>

            {/* <form action={updateEmail}>
                <button type="submit">Change email</button>
            </form> */}

            {/* Actions vs onSubmit */}
            {/* https://www.reddit.com/r/nextjs/comments/19djmty/what_is_the_difference_between_action_vs_onsubmit/ */}
            {/* https://www.youtube.com/watch?v=dDpZfOQBMaU */}
            {/* Might just be good rule of thumb to keep actions in actions.ts */}
            {/* Database 'actions' are more pure but I don't know how to show toasts, etc */}
            <form action={updateProfile}>
                <div>
                    <input type="email" name="email_change" defaultValue={user.email} />
                    {/* TODO: show the below conditionally only after email_change triggered */}
                    <p>We just sent a email to new@email.address. Tap the link inside to confirm the change.</p>


                    <label htmlFor="password_change">New password</label>
                    <input
                        type="password"
                        name="password_change"
                        placeholder="Your password"
                        minLength={6}
                        required
                    />

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
            <form action={sendPasswordResetEmailAction}>
                <button type="submit">Reset password</button>
            </form>

            <hr />




            <Dialog>
                <DialogTrigger asChild>
                    <button
                        type="button"
                        className="bg-red-500 text-white px-4 py-2 rounded mt-4"
                    >
                        Delete my account
                    </button>
                </DialogTrigger>
                <DialogContent>
                    <DialogTitle>Delete account</DialogTitle>
                    <>
                        Are you sure you want to delete your account?

                        {listings?.length && listings.length > 0 && (
                            <>
                                {' '}Your listing{listings.length > 1 ? 's' : ''} will also be deleted:
                                <ul>
                                    {listings.map((listing) => (
                                        <li key={listing.slug}>{listing.name}</li>
                                    ))}
                                </ul>
                            </>
                        )}
                    </>

                    <DialogDescription>
                        This action cannot be undone.
                    </DialogDescription>


                    <div className="mt-4 flex gap-4">
                        <form action={deleteAccountAction}>
                            <button
                                type="submit"
                                className="bg-red-500 text-white px-4 py-2 rounded"
                            >
                                Yes, delete my account {listings.length > 0 && `and listings`}
                            </button>
                        </form>
                        <DialogClose asChild>
                            <button type="button" className="bg-gray-200 px-4 py-2 rounded">
                                No, cancel
                            </button>
                        </DialogClose>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
