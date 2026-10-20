import { createClient } from '@/utils/supabase/server';
import { cookies } from 'next/headers';

export default async function Page() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: todos } = await supabase.from('todos').select();

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Todos</h1>
      <ul className="list-disc pl-5 space-y-1">
        {todos && todos.length > 0 ? (
          todos.map((todo) => (
            <li key={todo.id}>{todo.name}</li>
          ))
        ) : (
          <li className="text-muted-foreground">No todos found or todos table is empty.</li>
        )}
      </ul>
    </main>
  );
}
