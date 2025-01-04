import { redirect } from 'next/navigation';

export default function Listings() {
    // No root page for listings, so just redirect to profile
    redirect('/profile');
}
