import { HomeActions } from "@/components/home-actions";

export default function Index() {
  return (
    <main className="flex-1 flex flex-col gap-6 px-4">
      <h2 className="font-medium text-xl mb-4">
        Find a home for your food scraps, wherever you are.
      </h2>
      <HomeActions />
    </main>
  );
}
