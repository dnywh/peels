import { redirect } from 'next/navigation';

export default function Listings() {
    // No root listings route for now, only subpages. Redirect to map
    redirect('/map');
    // Maybe it could show a list of listings I've contact in the past, ordered by most recent
    // Or a general sitemap (of community and business listings), Brown Pages style (split by country and state, area) for SEO
}
