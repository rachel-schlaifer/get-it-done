import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";


async function toggleTodo(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const isCompleted = formData.get("isCompleted") === "true";

  const supabase = await createClient();
  await supabase
    .from("todos")
    .update({ is_completed: !isCompleted })
    .eq("id", id);
  revalidatePath("/todo");
}

async function addTodo(formData: FormData) {
  'use server'
  const todo = formData.get('to_do') as string
  const supabase = await createClient()

  await supabase.from('todos').insert({ to_do: todo })
  console.log
  revalidatePath('/todo')
}

export default async function Page() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }
  const { data: todos } = await supabase.from("todos").select();

  return (
    <div className="p-8">
      <form action={addTodo} className="mb-8 flex gap-4">
        <input
          type="text"
          name="to_do"
          id="to_do"
          className="flex-1 rounded-md border border-gray-300 px-4 py-2"
          placeholder="Add a new todo..."
          required
        />
        <button
          type="submit"
          className="rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          Add Todo
        </button>
      </form>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Todo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created At
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>

        <tbody className="bg-white divide-y divide-gray-200">
          {todos?.map((todo) => (
            <tr key={todo.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {todo.to_do}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(todo.created_at).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    todo.is_completed
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {todo.is_completed ? "Completed" : "Pending"}
                </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <form action={toggleTodo}>
                    <input type="hidden" name="id" value={todo.id} />
                    <input
                      type="hidden"
                      name="isCompleted"
                      value={todo.is_completed.toString()}
                    />
                    <button
                      type="submit"
                      className={`p-2 rounded-full ${
                        todo.is_completed
                          ? "bg-green-300 hover:bg-green-600"
                          : "bg-gray-300 hover:bg-gray-600"
                      }`}
                    >
                      {todo.is_completed ? "✓" : "○"}
                    </button>
                  </form>
                </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
