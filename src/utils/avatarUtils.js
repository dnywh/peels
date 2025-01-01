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

export function getAvatarUrl(filename, bucket) {
    const supabase = createClient();
    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filename);
    return publicUrl;
} 
