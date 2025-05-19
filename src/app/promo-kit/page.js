import { redirect } from 'next/navigation';

export default function PromoKit() {
    redirect(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/static/promo-kit.zip`);
}
