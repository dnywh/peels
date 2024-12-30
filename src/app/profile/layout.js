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
                {/* TODO: This sidebar should be hidden via CSS on smaller breakpoint */}
                <div>
                    <hr />
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

                    {/* Main page content if relevant. Only renders if children */}
                    <main>
                        {children}
                    </main>




                </div>

            </div>
        </div>
    );
}
