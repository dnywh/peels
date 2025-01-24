import Image from "next/image";

//TODO: Use safer getPublicUrl method from Supabase
// But this adds complication and all my URLs are already public

// E.g.
// import { getAvatarUrl } from "@/utils/mediaUtils";

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

export default function RemoteImage({
  bucket,
  filename,
  alt,
  style,
  width,
  height,
  ...props
}) {
  // console.log("RemoteImage received:", { bucket, filename });
  // Handle missing filename or public folder images
  if (!filename || bucket === "public") {
    const imagePath = !filename ? "/avatars/default.png" : `/${filename}`;
    return (
      <Image
        src={imagePath}
        alt={alt}
        style={style}
        width={width}
        height={height}
        {...props}
      />
    );
  }

  // Handle Supabase storage images
  return (
    <Image
      src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filename}`}
      alt={alt}
      style={style}
      width={width}
      height={height}
      {...props}
    />
  );
}
