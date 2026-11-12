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

export function getTodos(): Todo[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter(isTodo);
  } catch {
    return [];
  }
}

export function saveTodos(todos: Todo[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch {
    // Storage may be unavailable in some browsers or private mode.
  }
}

export function getCategories(): string[] {
  if (typeof window === "undefined") {
    return DEFAULT_CATEGORIES;
  }

  try {
    const raw = window.localStorage.getItem(CATEGORY_KEY);
    if (!raw) {
      return DEFAULT_CATEGORIES;
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "string")) {
      return DEFAULT_CATEGORIES;
    }

    return Array.from(new Set([...DEFAULT_CATEGORIES, ...parsed]));
  } catch {
    return DEFAULT_CATEGORIES;
  }
}

export function saveCategories(categories: string[]): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(CATEGORY_KEY, JSON.stringify(categories));
  } catch {
    // Ignore localStorage write failures.
  }
}

export function addCategory(name: string): string | null {
  const trimmed = name.trim();
  if (!trimmed) {
    return null;
  }

  const categories = getCategories();
  if (categories.some((category) => category.toLowerCase() === trimmed.toLowerCase())) {
    return trimmed;
  }

  const next = [...categories, trimmed];
  saveCategories(next);
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
