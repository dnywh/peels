import ProfileData from '@/components/ProfileData';
import Link from 'next/link';

import NavLinks from './nav-links';
import ProfileRedirect from './profile-redirect';
import { signOutAction } from "@/app/actions";

export default function ProfileLayout({ children }) {
    return (
        <div>
            <ProfileRedirect />

            <div>
                <h2>Settings</h2>
                <NavLinks />

                <ProfileData />

                <div>
                    <form action={signOutAction}>
                        <button type="submit">
                            Sign out
                        </button>
                    </form>

                    <nav>
                        <Link href="/support">Support</Link>
                        <Link href="/terms">Terms</Link>
                        <Link href="/privacy">Privacy</Link>
                    </nav>
                </div>

                <hr />

                <main>
                    {children}
                </main>
            </div>
        </div>
    );
}
