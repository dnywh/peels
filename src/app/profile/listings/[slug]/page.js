import ListingForm from "@/components/ListingForm";
import Link from "next/link";

// Next.js automatically provides params
export default async function EditListingPage({ params }) {
    const { slug } = await params;

    return (
        <div>
            <h1>Edit Listing</h1>
            <ListingForm slug={slug} />
            <hr />
            {/* TODO: warn if unsaved changes? */}
            <Link href={`/listings/${slug}`}>View listing</Link>
        </div>
    );
} 
