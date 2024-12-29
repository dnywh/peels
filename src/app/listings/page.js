import { redirect } from 'next/navigation';

export default function Listings() {
    // This component can be empty, as we are handling redirection
    redirect('/map');
    // Maybe it could show a list of listings I've contact in the past, ordered by most recent
}
