import LoremIpsum from "@/components/LoremIpsum";

export default function Index() {
  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Privacy Policy</h2>
        <p>Here's our privacy policy.</p>
        <p>
          This site uses cookies for basic user functionality, like checking if
          you're logged in or not before trying to contact a Peels host.
        </p>
        <LoremIpsum />
      </main>
    </>
  );
}
