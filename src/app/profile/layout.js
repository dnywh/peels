import ProfileData from '@/components/ProfileData/ProfileData';
import NavLinks from './nav-links';
import ProfileRedirect from './profile-redirect';
export default function ProfileLayout({ children }) {
    return (
        <div className="max-w-5xl mx-auto p-4">
            <ProfileRedirect />

            <div>
                <h2>Settings</h2>
                <NavLinks />

                <ProfileData />

                <hr />

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
