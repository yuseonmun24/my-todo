import { NextResponse } from "next/server";
import { ensureDatabase, getDatabase, readCategories, readTodos, writeCategories, writeTodos } from "@/lib/db";

export async function GET() {
  await ensureDatabase();

  const todos = await readTodos();
  const categories = await readCategories();

  return NextResponse.json({
    todos: todos.map((todo) => ({
      id: todo.id,
      text: todo.text,
      category: todo.category,
      completed: Boolean(todo.completed),
      createdAt: todo.created_at,
      updatedAt: todo.updated_at,
    })),
    categories,
  });
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    todos?: Array<{
      id: string;
      text: string;
      category: string;
      completed: boolean;
      createdAt: string;
      updatedAt: string;
    }>;
    categories?: string[];
  };

  const todos = body.todos ?? [];
  const categories = body.categories ?? [];

  await ensureDatabase();
  await writeTodos(
    todos.map((todo) => ({
      id: todo.id,
      text: todo.text,
      category: todo.category,
      completed: todo.completed,
      createdAt: todo.createdAt,
      updatedAt: todo.updatedAt,
    })),
  );
  await writeCategories(categories);

  return NextResponse.json({
    todos,
    categories,
  });
}
