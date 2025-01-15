

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
import IconButton from "@/components/IconButton";
import Link from "next/link";

import AvatarUploadManager from "@/components/AvatarUploadManager";
import Form from "@/components/Form";
import Field from "@/components/Field";
import Label from "@/components/Label";
import Input from "@/components/Input";
import SubmitButton from "@/components/SubmitButton";
import Button from "@/components/Button";
import Description from "@/components/Description";
import EncodedEmailHyperlink from "@/components/EncodedEmailHyperlink";
import AdditionalSettings from "@/components/AdditionalSettings";

import ButtonToDialog from "@/components/ButtonToDialog";

export default async function ProfilePage({ searchParams }) {

    const message = (await searchParams)?.message
    const error = (await searchParams)?.error
    // console.log(message, error);

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


    async function updateProfile(formData) {
        "use server";

        // console.log("formData", formData);

        const supabase = await createClient();
        const {
            data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
            return redirect("/sign-in");
        }

        // Avatar upload handled in AvatarUploadManager

        // Update profile
        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                first_name: formData.get("first_name")?.toString(),
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
        if (formData.get("password_change") !== user.password && formData.get("password_change") !== "") {
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
        <>
            {/* TODO: Show these search param at both profile and profile/account, depending on which is routed to*/}
            {message && <p>Message: {message}</p>}
            {error && <p>Error: {error}</p>}

            <h1>Account</h1>


            {/* <form action={updateEmail}>
                <button type="submit">Change email</button>
            </form> */}

            {/* Actions vs onSubmit */}
            {/* https://www.reddit.com/r/nextjs/comments/19djmty/what_is_the_difference_between_action_vs_onsubmit/ */}
            {/* https://www.youtube.com/watch?v=dDpZfOQBMaU */}
            {/* Might just be good rule of thumb to keep actions in actions.ts */}
            {/* Database 'actions' are more pure but I don't know how to show toasts, etc */}
            <Form action={updateProfile}>
                <AvatarUploadManager
                    initialAvatar={profile?.avatar || ""}
                    bucket="avatars"
                    entityId={user.id}
                />

                <Field>
                    <Label>First Name</Label>
                    <Input
                        type="text"
                        name="first_name"
                        defaultValue={profile?.first_name || ""}
                    />
                </Field>

                <Field>
                    <Label htmlFor="email_change">Email</Label>
                    <Input type="email" name="email_change" defaultValue={user.email} />

                    {/* TODO: show the below conditionally only after email_change triggered */}
                    <Description>We just sent a email to new@email.address. Tap the link inside to confirm the change.</Description>
                </Field>

                <Field>
                    <Label htmlFor="password_change">New password</Label>
                    <Input
                        type="password"
                        name="password_change"
                        placeholder="Your password"
                        minLength={6}
                    />
                </Field>

                <SubmitButton>
                    Save changes
                </SubmitButton>
            </Form>

            <AdditionalSettings>
                <ButtonToDialog
                    variant="secondary"
                    initialButtonText="Export data"
                    dialogTitle="Coming soon"
                    cancelButtonText="Done"
                >
                    We’re still working on this feature. In the meantime, <EncodedEmailHyperlink address="c3VwcG9ydEBwZWVscy5hcHA=">reach out</EncodedEmailHyperlink> and ask us to export your data manually.
                </ButtonToDialog>
                <Form action={sendPasswordResetEmailAction}>
                    <SubmitButton variant="secondary" width="contained">Reset password</SubmitButton>
                </Form>
                <ButtonToDialog
                    initialButtonText="Delete account"
                    dialogTitle="Delete account"
                    confirmButtonText={`Yes, delete my account ${listings.length > 0 && `and listing${listings.length > 1 ? "s" : ""}`}`}
                    action={deleteAccountAction}
                >
                    Are you sure you want to delete your account? {listings?.length > 0 && (
                        <>
                            Your listing{listings.length > 1 ? "s" : ""} will also be deleted.
                        </>
                    )}
                </ButtonToDialog>
            </AdditionalSettings>
        </>
    );
}

