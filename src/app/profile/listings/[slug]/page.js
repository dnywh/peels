import ListingForm from "@/components/ListingForm";

// Next.js automatically provides params
export default async function EditListingPage({ params }) {
    const { slug } = await params;

    return (
        <div>
            <h1>Edit Listing</h1>
            <ListingForm slug={slug} />
        </div>
    );
} 
