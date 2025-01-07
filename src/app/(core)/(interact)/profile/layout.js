import ProfileLayoutClient from "@/components/ProfileLayoutClient";
import ProfileRedirect from "@/components/ProfileRedirect";
import ProfileSidebar from "@/components/ProfileSidebar";

export default function ProfileLayout({ children }) {
    return (
        <>
            <ProfileRedirect />
            <ProfileLayoutClient sidebar={<ProfileSidebar />}>
                {children}
            </ProfileLayoutClient>
        </>
    );
}

