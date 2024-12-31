import ListingWrite from "@/components/ListingWrite";
import BackButton from "@/components/BackButton";

export default async function NewListingFormContent({ searchParams }) {
    const listingType = (await searchParams).type

    return (
        <main>
            <header>
                <BackButton />
                <h1>List your {listingType}</h1>
                <p>Page description here that's specific for {listingType} listings.</p>
            </header>

            <ListingWrite />
        </main >
    )
}
