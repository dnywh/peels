import Hyperlink from "@/components/Hyperlink";

export const metadata = {
  title: 'Terms',
}

export default function Index() {
  return (
    <>
      <h1>Terms of use</h1>
      <p>
        Peels is currently <Hyperlink href="/preview">invite only</Hyperlink>. Our terms
        of use will be added here soon.
      </p>
    </>
  );
}
