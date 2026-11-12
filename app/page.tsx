"use client";

import { useEffect, useMemo, useState } from "react";

export type Todo = {
  id: string;
  text: string;
  category: string;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
};

const DEFAULT_CATEGORIES = ["일반", "업무", "개인", "쇼핑", "건강"];

const SORT_OPTIONS = {
  createdAtDesc: "최신순",
  createdAtAsc: "오래된순",
  completedLast: "완료된 항목 뒤로",
  alphabetical: "가나다순",
} as const;

type SortKey = keyof typeof SORT_OPTIONS;

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(date);

async function fetchTodosAndCategories() {
  const response = await fetch("/api/todos");
  if (!response.ok) {
    throw new Error("Failed to load todos");
  }

  const data = (await response.json()) as {
    todos: Todo[];
    categories: string[];
  };

  return data;
}

async function persistTodosAndCategories(nextTodos: Todo[], nextCategories: string[]) {
  const response = await fetch("/api/todos", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      todos: nextTodos,
      categories: nextCategories,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to save todos");
  }

  return (await response.json()) as {
    todos: Todo[];
    categories: string[];
  };
}

function createTodo(text: string, category: string): Todo {
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

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [draft, setDraft] = useState("");
  const [category, setCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState("");
  const [categories, setCategories] = useState<string[]>(DEFAULT_CATEGORIES);
  const [sortKey, setSortKey] = useState<SortKey>("createdAtDesc");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editCategory, setEditCategory] = useState(DEFAULT_CATEGORIES[0]);
  const [todayLabel, setTodayLabel] = useState("오늘");

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await fetchTodosAndCategories();
        setTodos(data.todos);
        setCategories(data.categories.length > 0 ? data.categories : DEFAULT_CATEGORIES);
        setCategory(data.categories[0] ?? DEFAULT_CATEGORIES[0]);
        setEditCategory(data.categories[0] ?? DEFAULT_CATEGORIES[0]);
      } catch {
        setTodos([]);
        setCategories(DEFAULT_CATEGORIES);
        setCategory(DEFAULT_CATEGORIES[0]);
        setEditCategory(DEFAULT_CATEGORIES[0]);
      }

      setTodayLabel(formatDate(new Date()));
    };

    void loadData();
  }, []);

  const remainingTodos = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const sortedTodos = useMemo(() => {
    const next = [...todos];

    switch (sortKey) {
      case "createdAtAsc":
        return next.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        );
      case "completedLast":
        return next.sort((a, b) => {
          if (a.completed === b.completed) {
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
          return Number(a.completed) - Number(b.completed);
        });
      case "alphabetical":
        return next.sort((a, b) => a.text.localeCompare(b.text, "ko"));
      case "createdAtDesc":
      default:
        return next.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
    }
  }, [sortKey, todos]);

  const addTodo = async () => {
    const trimmed = draft.trim();
    if (!trimmed) {
      return;
    }

    const nextTodos = [createTodo(trimmed, category), ...todos];
    setTodos(nextTodos);
    setDraft("");

    try {
      await persistTodosAndCategories(nextTodos, categories);
    } catch {
      // Ignore persistence errors and keep the UI responsive.
    }
  };

  const addCustomCategory = async () => {
    const trimmed = customCategory.trim();
    if (!trimmed) {
      return;
    }

    const nextCategories = Array.from(
      new Set([...categories, trimmed]),
    );
    setCategories(nextCategories);
    setCategory(trimmed);
    setEditCategory(trimmed);
    setCustomCategory("");

    try {
      await persistTodosAndCategories(todos, nextCategories);
    } catch {
      // Ignore persistence errors and keep the UI responsive.
    }
  };

  const toggleTodo = async (id: string) => {
    const nextTodos = todos.map((todo) =>
      todo.id === id
        ? {
            ...todo,
            completed: !todo.completed,
            updatedAt: new Date().toISOString(),
          }
        : todo,
    );
    setTodos(nextTodos);

    try {
      await persistTodosAndCategories(nextTodos, categories);
    } catch {
      // Ignore persistence errors and keep the UI responsive.
    }
  };

  const deleteTodo = async (id: string) => {
    const nextTodos = todos.filter((todo) => todo.id !== id);
    setTodos(nextTodos);

    if (editingId === id) {
      setEditingId(null);
      setEditText("");
    }

    try {
      await persistTodosAndCategories(nextTodos, categories);
    } catch {
      // Ignore persistence errors and keep the UI responsive.
    }
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
    setEditCategory(todo.category);
  };

  const saveEdit = async (id: string) => {
    const trimmed = editText.trim();
    if (!trimmed) {
      return;
    }

    const nextTodos = todos.map((todo) =>
      todo.id === id
        ? {
            ...todo,
            text: trimmed,
            category: editCategory,
            updatedAt: new Date().toISOString(),
          }
        : todo,
    );
    setTodos(nextTodos);
    setEditingId(null);
    setEditText("");

    try {
      await persistTodosAndCategories(nextTodos, categories);
    } catch {
      // Ignore persistence errors and keep the UI responsive.
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100 px-4 py-8 text-slate-700">
      <div className="mx-auto max-w-2xl">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-500">
              Cat Todo
            </p>
            <h1 className="mt-2 text-3xl font-bold text-violet-900">오늘의 할 일</h1>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700 shadow-sm">
            <span className="text-xl">🐱</span>
            <span>{todayLabel}</span>
          </div>
        </div>

        <div className="rounded-[2rem] border border-violet-200 bg-white/75 p-5 shadow-[0_24px_80px_rgba(139,92,246,0.15)] backdrop-blur-sm sm:p-7">
          <div className="mb-5 flex flex-wrap gap-2">
            {categories.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setCategory(value)}
                className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
                  category === value
                    ? "bg-violet-500 text-white shadow-sm"
                    : "bg-violet-50 text-violet-700 hover:bg-violet-100"
                }`}
              >
                {value}
              </button>
            ))}
          </div>

          <div className="mb-5 flex gap-3">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void addTodo();
                }
              }}
              placeholder="할 일을 입력해 주세요"
              className="flex-1 rounded-2xl border border-violet-200 bg-violet-50/60 px-4 py-3 text-base outline-none transition focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              className="rounded-2xl border border-violet-200 bg-violet-50/60 px-3 py-3 text-sm text-violet-700 outline-none focus:border-violet-400"
            >
              {categories.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
            <button
              onClick={() => void addTodo()}
              className="rounded-2xl bg-gradient-to-r from-violet-500 to-indigo-500 px-4 py-3 font-semibold text-white shadow-md shadow-violet-200 transition hover:brightness-105"
            >
              추가
            </button>
          </div>

          <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl bg-violet-50 p-3">
            <div className="text-sm font-medium text-violet-700">
              남은 할 일 <span className="text-xl font-bold">{remainingTodos}</span>개
            </div>
            <select
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value as SortKey)}
              className="rounded-full border border-violet-200 bg-white px-3 py-2 text-sm text-violet-700 outline-none"
            >
              {Object.entries(SORT_OPTIONS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-5 flex gap-2">
            <input
              value={customCategory}
              onChange={(event) => setCustomCategory(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void addCustomCategory();
                }
              }}
              placeholder="새 카테고리 추가"
              className="flex-1 rounded-2xl border border-violet-200 bg-violet-50/60 px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
            />
            <button
              onClick={() => void addCustomCategory()}
              className="rounded-2xl bg-violet-100 px-4 py-2.5 text-sm font-semibold text-violet-700 transition hover:bg-violet-200"
            >
              카테고리 추가
            </button>
          </div>

          <div className="space-y-3">
            {sortedTodos.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-violet-200 bg-violet-50/60 px-4 py-10 text-center text-sm text-violet-600">
                고양이 친구가 쉬고 있어요. 할 일을 추가해 보세요 🐾
              </div>
            ) : (
              sortedTodos.map((todo) => (
                <div
                  key={todo.id}
                  className="rounded-2xl border border-violet-100 bg-white/90 p-3 shadow-sm"
                >
                  {editingId === todo.id ? (
                    <div className="space-y-3">
                      <input
                        value={editText}
                        onChange={(event) => setEditText(event.target.value)}
                        className="w-full rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 outline-none focus:border-violet-400"
                      />
                      <div className="flex gap-2">
                        <select
                          value={editCategory}
                          onChange={(event) => setEditCategory(event.target.value)}
                          className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm text-violet-700 outline-none"
                        >
                          {categories.map((value) => (
                            <option key={value} value={value}>
                              {value}
                            </option>
                          ))}
                        </select>
                        <button
                          onClick={() => void saveEdit(todo.id)}
                          className="rounded-xl bg-violet-500 px-3 py-2 text-sm font-semibold text-white"
                        >
                          저장
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="rounded-xl bg-violet-100 px-3 py-2 text-sm font-semibold text-violet-700"
                        >
                          취소
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => void toggleTodo(todo.id)}
                        aria-label={todo.completed ? "완료 취소" : "완료 체크"}
                        className={`flex h-6 w-6 items-center justify-center rounded-full border-2 transition ${
                          todo.completed
                            ? "border-emerald-400 bg-emerald-400 text-white"
                            : "border-violet-300 bg-white text-transparent hover:border-violet-400"
                        }`}
                      >
                        ✓
                      </button>

                      <div className="flex-1">
                        <p
                          className={`text-base ${
                            todo.completed ? "text-slate-400 line-through" : "text-slate-700"
                          }`}
                        >
                          {todo.text}
                        </p>
                        <div className="mt-1 flex items-center gap-2 text-xs text-violet-500">
                          <span className="rounded-full bg-violet-100 px-2 py-0.5 font-medium">
                            {todo.category}
                          </span>
                          <span>{new Date(todo.createdAt).toLocaleDateString("ko-KR")}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => startEdit(todo)}
                          className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-200"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => void deleteTodo(todo.id)}
                          className="rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-500 transition hover:bg-rose-200"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
