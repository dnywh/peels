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

  // Fetch both notes and profile data
  const [{ data: notes }, { data: profile }] = await Promise.all([
    supabase.from("notes").select().eq('user_id', user.id),
    supabase.from("profiles").select().eq('id', user.id).single()
  ]);

  async function addNote(formData: FormData) {
    'use server';
    
    const title = formData.get('title')?.toString();
    if (!title) return;

    const supabase = await createClient();
    await supabase.from('notes').insert({ 
      title,
      user_id: user?.id
    });
    
    revalidatePath('/notes'); // Refresh
  }

  return (
    <div>
      <h1>
        {profile?.first_name ? 
          `${profile.first_name}'s Notes only` : 
          'My Notes'}
      </h1>
      <form action={addNote}>
        <input
          type="text"
          name="title"
          placeholder="Enter a new note..."
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
