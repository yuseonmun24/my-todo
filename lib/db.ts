import { createClient } from "@libsql/client";

export const DEFAULT_DATABASE_URL = "file:local.db";

export function getDatabaseUrl(): string {
  return process.env.TURSO_DATABASE_URL ?? DEFAULT_DATABASE_URL;
}

export function getDatabase() {
  return createClient({
    url: getDatabaseUrl(),
  });
}

export async function ensureDatabase(): Promise<void> {
  const db = getDatabase();

  await db.execute(`
    CREATE TABLE IF NOT EXISTS todos (
      id TEXT PRIMARY KEY,
      text TEXT NOT NULL,
      category TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      name TEXT PRIMARY KEY
    )
  `);

  await db.execute({
    sql: `
      INSERT OR IGNORE INTO categories (name)
      VALUES (?, ?, ?, ?, ?)
    `,
    args: ["일반", "업무", "개인", "쇼핑", "건강"],
  });
}

export type DbTodoRow = {
  id: string;
  text: string;
  category: string;
  completed: number;
  created_at: string;
  updated_at: string;
};

export async function readTodos(): Promise<DbTodoRow[]> {
  await ensureDatabase();
  const db = getDatabase();
  const result = await db.execute(`
    SELECT id, text, category, completed, created_at, updated_at
    FROM todos
    ORDER BY created_at DESC
  `);

  return result.rows.map((row) => ({
    id: String(row.id),
    text: String(row.text),
    category: String(row.category),
    completed: Number(row.completed),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }));
}

export async function writeTodos(todos: Array<{
  id: string;
  text: string;
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}>): Promise<void> {
  await ensureDatabase();
  const db = getDatabase();

  await db.execute("DELETE FROM todos");

  for (const todo of todos) {
    await db.execute({
      sql: `
        INSERT INTO todos (id, text, category, completed, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      args: [
        todo.id,
        todo.text,
        todo.category,
        todo.completed ? 1 : 0,
        todo.createdAt,
        todo.updatedAt,
      ],
    });
  }
}

export async function readCategories(): Promise<string[]> {
  await ensureDatabase();
  const db = getDatabase();
  const result = await db.execute(`
    SELECT name
    FROM categories
    ORDER BY name ASC
  `);

  return result.rows.map((row) => String(row.name));
}

export async function writeCategories(categories: string[]): Promise<void> {
  await ensureDatabase();
  const db = getDatabase();

  await db.execute("DELETE FROM categories");

  for (const category of categories) {
    const trimmed = category.trim();
    if (!trimmed) {
      continue;
    }

    await db.execute({
      sql: `INSERT INTO categories (name) VALUES (?)`,
      args: [trimmed],
    });
  }
}
