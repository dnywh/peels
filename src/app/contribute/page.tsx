import { redirect } from "next/navigation";

export default function ContributePage() {
  redirect(
    "https://github.com/dnywh/peels?tab=readme-ov-file#contributing-to-peels"
  );
}
