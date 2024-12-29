'use client'; // Needed for styled-jsx
import { usePathname } from 'next/navigation';
import ProfileRedirect from './profile-redirect';

export default function ProfileLayout({ children }) {
    const pathname = usePathname();

    return (
        <div className="max-w-5xl mx-auto p-4">
            <ProfileRedirect />

            <div className="flex flex-col lg:flex-row gap-8">
                <nav className="w-full lg:w-64 flex-shrink-0">
                    <ul className="flex flex-col gap-2">
                        {[
                            { href: '/profile/account', label: 'Account' },
                            { href: '/profile/appearance', label: 'Appearance' },
                            { href: '/profile/notifications', label: 'Notifications' },
                        ].map(({ href, label }) => (
                            <li key={href}>
                                <a
                                    href={href}
                                    className={`block p-2 rounded-lg transition-colors
                                        ${pathname === href
                                            ? 'bg-secondary'
                                            : 'hover:bg-secondary/50'
                                        }`}
                                    style={{
                                        backgroundColor: pathname === href ? 'lightgray' : undefined,
                                    }}
                                >
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <main className="flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
