import ListingWrite from "@/components/ListingWrite";
import IconButton from "@/components/IconButton";

export default async function NewListingFormContent({ searchParams }) {
    const listingType = (await searchParams).type

    const validatedListingTypes = ['community', 'business', 'residential']
    const finalListingType = validatedListingTypes.includes(listingType) ? listingType : 'residential';

    return (
        <main>
            <header>
                <IconButton />
                <h1>
                    {finalListingType === 'community' || finalListingType === 'business' ? `List your ${finalListingType}` : 'Add your listing'}
                </h1>
                <p>
                    {finalListingType === 'community' && `People can drop off food scraps to your community garden, farm, or similar.`}
                    {finalListingType === 'business' && `People can pick up spent coffee from your cafe, spent hops from your brewery, or similar.`}
                    {finalListingType === 'residential' && `A private residence or similar.`}
                </p>
            </header>

            <ListingWrite />
        </main >
    )
}
