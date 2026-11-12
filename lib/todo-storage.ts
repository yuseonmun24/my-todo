import { readCategories, readTodos, writeCategories, writeTodos } from "./db";

export type Todo = {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const STORAGE_KEY = "my-todo:items";
const CATEGORY_KEY = "my-todo:categories";

export const DEFAULT_CATEGORIES = [
  "일반",
  "업무",
  "개인",
  "쇼핑",
  "건강",
];

function isTodo(value: unknown): value is Todo {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const todo = value as Record<string, unknown>;

  return (
    typeof todo.id === "string" &&
    typeof todo.text === "string" &&
    typeof todo.category === "string" &&
    typeof todo.completed === "boolean" &&
    typeof todo.createdAt === "string" &&
    typeof todo.updatedAt === "string"
  );
}

export async function getTodos(): Promise<Todo[]> {
  try {
    const rows = await readTodos();
    return rows.map((row) => ({
      id: row.id,
      text: row.text,
      category: row.category,
      completed: Boolean(row.completed),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch {
    return [];
  }
}

export async function saveTodos(todos: Todo[]): Promise<void> {
  try {
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
  } catch {
    // Ignore persistence failures in environments without the database.
  }
}

export async function getCategories(): Promise<string[]> {
  try {
    const rows = await readCategories();
    return rows.length > 0 ? Array.from(new Set([...DEFAULT_CATEGORIES, ...rows])) : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export async function saveCategories(categories: string[]): Promise<void> {
  try {
    await writeCategories(categories);
  } catch {
    // Ignore persistence failures in environments without the database.
  }
}

export async function addCategory(name: string): Promise<string | null> {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const categories = await getCategories();
  if (categories.some((category: string) => category.toLowerCase() === trimmed.toLowerCase())) {
    return trimmed;
  }

  const next = [...categories, trimmed];
  await saveCategories(next);
  return trimmed;
}

export function createTodo(text: string, category: string): Todo {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    text,
    category,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export const todoStorage = {
  getTodos,
  saveTodos,
  getCategories,
  saveCategories,
  addCategory,
  createTodo,
};
