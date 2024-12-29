'use client';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

export default function ProfileRedirect() {
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        function handleResize() {
            const isDesktop = window.innerWidth >= 1024;
            const isRootProfilePath = pathname === '/profile';

            if (isDesktop && isRootProfilePath) {
                router.push('/profile/account');
            }
        }

        // Initial check
        handleResize();

        // Listen for resize events
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [pathname, router]);

    return null;
} 
