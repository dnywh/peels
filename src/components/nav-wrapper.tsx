'use client';

import { usePathname } from 'next/navigation';
import { NavAuth } from './nav-auth';

// Routes where we want to show the NavAuth component
const AUTH_ROUTES = ['/', '/terms', '/privacy'];

export function NavWrapper() {
  const pathname = usePathname();
  
  // Only show NavAuth on specified routes
  if (AUTH_ROUTES.includes(pathname)) {
    return <NavAuth />;
  }
  
  // Return null for other routes
  return null;
} 