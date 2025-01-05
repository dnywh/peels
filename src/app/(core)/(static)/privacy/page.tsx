import LoremIpsum from "@/components/LoremIpsum";

export default function Index() {
  return (
    <>
      <main className="flex-1 flex flex-col gap-6 px-4">
        <h2 className="font-medium text-xl mb-4">Privacy Policy</h2>
        <p>Here's our privacy policy.</p>
        <LoremIpsum />
      </main>
    </>
  );
}
