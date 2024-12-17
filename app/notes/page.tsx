import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache"; // to refresh the page after adding a note

export default async function Page() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  const { data: notes } = await supabase.from("notes").select();

  async function addNote(formData: FormData) {
    'use server';
    
    const title = formData.get('title')?.toString();
    if (!title) return;

    const supabase = await createClient();
    await supabase.from('notes').insert({ title });
    
    revalidatePath('/notes');
  }

  return (
    <div>
      <form action={addNote}>
        <input
          type="text"
          name="title"
          placeholder="Enter your note..."
          className="border p-2 mr-2"
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Add Note
        </button>
      </form>

      <pre className="mt-4">{JSON.stringify(notes, null, 2)}</pre>
    </div>
  )
}
