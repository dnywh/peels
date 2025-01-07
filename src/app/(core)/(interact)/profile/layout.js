import ProfileLayoutClient from "@/components/ProfileLayoutClient";
import ProfileRedirect from "./profile-redirect";
import AvatarRead from "@/components/AvatarRead";
import NavLinks from "./nav-links";
import ProfileData from "@/components/ProfileData";
import LegalFooter from "@/components/LegalFooter";
import { signOutAction } from "@/app/actions";
import SubmitButton from '@/components/SubmitButton';


export default function ProfileLayout({ children }) {
    const sidebar = (
        <>
            <AvatarRead />
            <h2>Settings</h2>
            <NavLinks />
            <ProfileData />
            <form action={signOutAction}>
                <SubmitButton>Sign out</SubmitButton>
            </form>
            <LegalFooter />
        </>
    );

    return (
        <div>
            <ProfileRedirect />
            <ProfileLayoutClient sidebar={sidebar}>
                {children}
            </ProfileLayoutClient>
        </div>
    );
}

