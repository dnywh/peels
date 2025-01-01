import ProfileData from '@/components/ProfileData';
import Link from 'next/link';

import NavLinks from './nav-links';
import ProfileRedirect from './profile-redirect';
import BackButton from '@/components/BackButton';
import { signOutAction } from "@/app/actions";
import SubmitButton from '@/components/SubmitButton';
import AvatarUploadView from '@/components/AvatarUploadView';

import { styled } from "@pigment-css/react";

const ProfilePageLayout = styled("div")({
    display: "flex",
    flexDirection: "row",
    // alignItems: "stretch",
    gap: "2rem",
});

const ProfileSidebarContainer = styled("div")({
    display: "none",
    '@media (min-width: 768px)': {
        display: "block",
    },
});

const ProfileSidebar = styled("div")({
    display: "flex",
    flexDirection: "column",
    alignItems: "stretch",
    gap: "2rem",
    width: "16rem",
    // backgroundColor: "tomato",
    '@media (min-width: 768px)': {
        position: "sticky",
        top: 0,
        border: "1px solid grey",
    },
});


// Avatar logic
// Add a helper function to get URLs when needed
async function getAvatarUrl(filename) {
    const supabase = await createClient();
    const {
        data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(filename);
    return publicUrl;
}

async function uploadAvatar(file) {
    const supabase = createClient();

    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from("avatars")
        .upload(fileName, file);

    if (error) throw error;

    return fileName;
}

async function deleteAvatar(filePath) {
    const supabase = createClient();
    const { error } = await supabase.storage
        .from("avatars")
        .remove([filePath]);

    if (error) throw error;
}

export default function ProfileLayout({ children }) {
    const [avatar, setAvatar] = useState(
        profile.avatar ? profile.avatar : ""
    );

    const handleAvatarChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                // If there's an existing avatar, delete it first
                if (avatar) {
                    // Extract the file path from the URL
                    const existingFilePath = avatar.split("/").pop();
                    await deleteAvatar(existingFilePath);
                }

                const avatarUrl = await uploadAvatar(file);
                setAvatar(avatarUrl);
            } catch (error) {
                console.error("Error handling avatar:", error);
                // Show error message to user
            }
        }
    };

    const handleAvatarDelete = async () => {
        if (avatar) {
            try {
                const filePath = avatar.split("/").pop();
                await deleteAvatar(filePath);
                setAvatar("");
            } catch (error) {
                console.error("Error deleting avatar:", error);
                // Show error message to user
            }
        }
    };

    return (
        <>
            <ProfileRedirect />

            <ProfilePageLayout>
                {/* TODO: This sidebar should be hidden via CSS on smaller breakpoint */}
                <ProfileSidebarContainer>
                    <ProfileSidebar>
                        <AvatarUploadView
                            avatar={avatar}
                            getAvatarUrl={getAvatarUrl}
                            onChange={handleAvatarChange}
                            onDelete={handleAvatarDelete}
                        />
                        <h2>Settings</h2>
                        <NavLinks />

                        <ProfileData />


                        <form action={signOutAction}>
                            <SubmitButton>Sign out</SubmitButton>
                        </form>

                        <nav>
                            <Link href="/support">Support</Link>
                            <Link href="/terms">Terms</Link>
                            <Link href="/privacy">Privacy</Link>
                        </nav>
                    </ProfileSidebar>
                </ProfileSidebarContainer>

                {/* Main page content if relevant. Only renders if children */}
                {children && (
                    <main>
                        <BackButton>Back (only on mobile)</BackButton>
                        {children}
                    </main>
                )}
            </ProfilePageLayout>
        </>
    );
}

