import Hyperlink from "@/components/Hyperlink";
// import Heading from "@/components/Heading";

export default function Index() {
  return (
    <>
      {/* <Heading level="h3">Peels is currently invite only</Heading> */}
      <h1>Peels is currently invite only</h1>
      <p>
        We need to put the brakes on organic sign ups until we’ve added proper{" "}
        <Hyperlink href="/terms">Terms</Hyperlink> and{" "}
        <Hyperlink href="/privacy">Privacy</Hyperlink> pages. This is to cover our legal
        bums but also lets us iron out some last remaining details.
      </p>
      <p>
        Have we spoken elsewhere about giving you early access? Or maybe you’re
        just particularly keen to get your hands on Peels? Please{" "}
        <Hyperlink href="/support">reach out</Hyperlink> for an invite code.
      </p>
    </>
  );
}
