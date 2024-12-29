'use client'; // Needed for styled-jsx
// import { usePathname } from 'next/navigation';
// import Link from 'next/link';

import ProfileRedirect from './profile-redirect';

export default function ProfileLayout({ children }) {
    return (
        <div style={{ padding: '1rem' }}>
            <ProfileRedirect />

            <nav style={{ marginBottom: '1rem' }}>
                <ul>
                    <li><a href="/profile/account">Account</a></li>
                    <li><a href="/profile/appearance">Appearance</a></li>
                    <li><a href="/profile/notifications">Notifications</a></li>
                </ul>
            </nav>

            {children}
        </div>
    );
}
