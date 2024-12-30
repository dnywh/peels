"use client";
import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

export default function ResetPasswordTwo() {
    useEffect(() => {
        const supabase = createClient();
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event == "PASSWORD_RECOVERY") {
                const newPassword = prompt("What would you like your new password to be?");
                const { data, error } = await supabase.auth
                    .updateUser({ password: newPassword })

                if (data) alert("Password updated successfully!")
                if (error) alert("There was an error updating your password.")
            }
            else {
                alert("You are not authorized to reset your password.")
            }
        })
    }, [])
    return (
        <>
            This is a test page
        </>
    );
}
