'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from './ui/button';

export default function SignInButton() {
  const pathname = usePathname();
  
  return (
    <Button asChild size="sm" variant={"outline"}>
      <Link href={`/sign-in?next=${pathname}`}>Sign in</Link>
    </Button>
  );
} 