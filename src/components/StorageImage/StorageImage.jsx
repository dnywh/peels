import Image from "next/image";
import avatar from "./avatar.png";
//TODO: Use safer getPublicUrl method from Supabase
// But this adds complication and all my URLs are already public

// function getListingAvatarUrl(filename) {
//   const {
//     data: { publicUrl },
//   } = supabase.storage.from("listing_avatars").getPublicUrl(filename);
//   return publicUrl;
// }

// function getUserAvatarUrl(filename) {
//   const {
//     data: { publicUrl },
//   } = supabase.storage.from("avatars").getPublicUrl(filename);
//   return publicUrl;
// }

// function getPhotoUrl(filename) {
//   const {
//     data: { publicUrl },
//   } = supabase.storage.from("listing_photos").getPublicUrl(filename);
//   return publicUrl;
// }

export default function StorageImage({
  bucket,
  filename,
  alt,
  style,
  size = 100,
  ...props
}) {
  if (!filename) {
    return (
      <Image
        src={avatar}
        alt={alt}
        style={style}
        width={size}
        height={size}
        {...props}
      />
    );
  }
  return (
    <Image
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`}
      alt={alt}
      style={style}
      width={size}
      height={size}
      {...props}
    />
  );
}
