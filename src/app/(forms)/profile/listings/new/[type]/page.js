import ListingWrite from "@/components/ListingWrite";
import FormHeader from '@/components/FormHeader';

const typeConfig = {
    residential: {
        title: 'Add your listing',
        description: 'A private residence or similar.'
    },
    community: {
        title: 'List your community',
        description: 'People can drop off food scraps to your community garden, farm, or similar.'
    },
    business: {
        title: 'List your business',
        description: 'People can pick up spent coffee from your cafe, spent hops from your brewery, or similar.'
    }
};

export default async function NewListingFormContent({ params }) {
    const { type } = await params;
    const config = typeConfig[type] || typeConfig.residential;

    return (
        <>
            <FormHeader action="back">
                <h1>{config.title}</h1>
                <p>{config.description}</p>
            </FormHeader>

            <ListingWrite />
        </>
    );
}

// Validate params at build time
export async function generateStaticParams() {
    return [
        { type: 'residential' },
        { type: 'community' },
        { type: 'business' },
    ];
} 
