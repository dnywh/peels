import { createClient } from "@/utils/supabase/client";

export async function uploadAvatar(file, bucket) {
    const supabase = createClient();
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;

    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
    if (error) throw error;
    return fileName;
}

export async function deleteAvatar(filePath, bucket) {
    const supabase = createClient();
    const { error } = await supabase.storage.from(bucket).remove([filePath]);
    if (error) throw error;
}

export function getAvatarUrl(filename, bucket) {
    const supabase = createClient();
    const {
        data: { publicUrl },
    } = supabase.storage.from(bucket).getPublicUrl(filename);
    return publicUrl;
} 
