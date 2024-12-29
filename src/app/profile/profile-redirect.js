'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ProfileRedirect() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (pathname !== '/profile') return;

        // Use matchMedia instead of resize event
        const mediaQuery = window.matchMedia('(min-width: 1024px)');

        function handleViewportChange(e) {
            if (e.matches) { // is desktop
                router.push('/profile/account');
            }
        }

        // Check initial viewport size
        handleViewportChange(mediaQuery);

        // Listen for viewport changes
        mediaQuery.addEventListener('change', handleViewportChange);
        return () => mediaQuery.removeEventListener('change', handleViewportChange);
    }, [pathname, router]);

    return null;
} 
