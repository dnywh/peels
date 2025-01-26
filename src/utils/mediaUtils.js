import { createClient } from "@/utils/supabase/client";

export async function uploadAvatar(file, bucket, id) {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    // First try to delete existing file (ignore error if it doesn't exist)
    await supabase.storage
        .from(bucket)
        .remove([fileName])
        .catch(() => { });

    // Then upload the new file
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
            upsert: true // This will overwrite if exists
        });

    if (error) throw error;
    console.log('Avatar uploaded:', data);

    // Update the corresponding database table
    if (bucket === 'avatars') {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar: fileName })
            .eq('id', id);
        if (updateError) throw updateError;
    } else if (bucket === 'listing_avatars') {
        const { error: updateError } = await supabase
            .from('listings')
            .update({ avatar: fileName })
            .eq('slug', id);
        if (updateError) throw updateError;
    }

    return fileName;
}

export async function deleteAvatar(filePath, bucket, id) {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;

    // Update the corresponding database table
    if (bucket === 'avatars') {
        const { error: updateError } = await supabase
            .from('profiles')
            .update({ avatar: null })
            .eq('id', id);
        if (updateError) throw updateError;
    } else if (bucket === 'listing_avatars') {
        const { error: updateError } = await supabase
            .from('listings')
            .update({ avatar: null })
            .eq('slug', id);
        if (updateError) throw updateError;
    }
}

export function getListingPhotoUrl(filename, bucket) {
    return `https://mfnaqdyunuafbwukbbyr.supabase.co/storage/v1/object/public/${bucket}/${filename}`;
}

export function getAvatarUrl(filename, bucket) {
    // Just using hardcoded URLs for now
    return `https://mfnaqdyunuafbwukbbyr.supabase.co/storage/v1/object/public/${bucket}/${filename}`;

    // TODO:
    // Set some privacy controls, expiry and grab the links dynamically:
    // const supabase = createClient();
    // const {
    //     data: { publicUrl },
    // } = supabase.storage.from(bucket).getPublicUrl(filename);
    //return publicUrl;
}

export async function uploadListingPhoto(file, listingSlug = null) {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from('listing_photos')
        .upload(fileName, file);

    if (error) throw error;
    console.log('Photo uploaded:', data);

    // Only update the database if we have a listing slug
    if (listingSlug) {
        const { data: listing, error: fetchError } = await supabase
            .from('listings')
            .select('photos')
            .eq('slug', listingSlug)
            .single();
        if (fetchError) throw fetchError;

        const photos = listing.photos || [];
        const { error: updateError } = await supabase
            .from('listings')
            .update({ photos: [...photos, fileName] })
            .eq('slug', listingSlug);
        if (updateError) throw updateError;
    }

    return fileName;
}

export async function deleteListingPhoto(filePath, listingSlug) {
    const supabase = createClient();

    try {
        // Delete from storage
        const { error: storageError } = await supabase.storage
            .from('listing_photos')
            .remove([filePath]);
        if (storageError) throw storageError;

        // Update the photos array
        const { data: listing } = await supabase
            .from('listings')
            .select('photos')
            .eq('slug', listingSlug)
            .single();

        const updatedPhotos = listing.photos.filter(photo => photo !== filePath);

        const { error: updateError } = await supabase
            .from('listings')
            .update({ photos: updatedPhotos })
            .eq('slug', listingSlug);
        if (updateError) throw updateError;

        console.log('Photo deleted successfully:', filePath);
        return updatedPhotos;
    } catch (error) {
        console.error('Error deleting photo:', error);
        throw error;
    }
}
