import { redirect } from "next/navigation";

export default function Contribute() {
  // No contribute page yet, but "www.peels.app/contribute" is used in a few places as a shorthand for the below
  redirect(
    "https://github.com/dnywh/peels?tab=readme-ov-file#contributing-to-peels"
  );
  // Could be a catch-all page for technical contributions, language support, and so on.
  // See also the related FAQ
}
