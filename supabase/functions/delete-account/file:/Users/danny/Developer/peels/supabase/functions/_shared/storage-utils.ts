export async function deleteStorageObject(supabase, bucket, path) {
  if (!path) return;
  const { error } = await supabase.storage.from(bucket).remove([
    path
  ]);
  if (error) {
    console.error(`Error deleting from ${bucket}:`, error);
    throw error;
  }
  console.log(`Deleted from ${bucket}:`, path);
}
export async function deleteListingMedia(supabase, slug) {
  // Get listing media info
  const { data: listing, error: fetchError } = await supabase.from("listings").select("avatar, photos").eq("slug", slug).single();
  if (fetchError) throw fetchError;
  const deletePromises = [];
  // Delete avatar if exists
  if (listing?.avatar) {
    deletePromises.push(deleteStorageObject(supabase, "listing_avatars", listing.avatar));
  }
  // Delete all photos if they exist
  if (listing?.photos?.length) {
    deletePromises.push(Promise.all(listing.photos.map((photo)=>deleteStorageObject(supabase, "listing_photos", photo))));
  }
  await Promise.all(deletePromises);
}
