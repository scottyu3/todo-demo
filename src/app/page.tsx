"use client";

import { useState } from "react";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");

  function addTodo(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    setTodos((prev) => [
      { id: crypto.randomUUID(), text, completed: false, createdAt: Date.now() },
      ...prev,
    ]);
    setInput("");
  }

  function toggleTodo(id: string) {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  }

  function deleteTodo(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const remaining = todos.filter((t) => !t.completed).length;

  return (
    <main className="max-w-lg mx-auto px-4 py-16">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-1">Todo</h1>
        <p className="text-gray-400 text-sm">
          Built live by an autonomous agent team
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={addTodo} className="flex gap-2 mb-8">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What needs to be done?"
          className="flex-1 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm placeholder:text-gray-600 focus:outline-none focus:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-5 py-3 rounded-xl text-sm transition-colors"
        >
          Add
        </button>
      </form>

      {/* Todo list */}
      {todos.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          <p className="text-lg mb-1">No tasks yet</p>
          <p className="text-sm">Add one above to get started</p>
        </div>
      ) : (
        <>
          <ul className="space-y-2 mb-6">
            {todos.map((todo) => (
              <li
                key={todo.id}
                className="group flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 transition-all hover:border-gray-700"
              >
                <button
                  onClick={() => toggleTodo(todo.id)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    todo.completed
                      ? "bg-blue-600 border-blue-600"
                      : "border-gray-600 hover:border-blue-500"
                  }`}
                >
                  {todo.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </button>
                <span
                  className={`flex-1 text-sm transition-all ${
                    todo.completed ? "line-through text-gray-600" : "text-gray-200"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <p className="text-center text-gray-600 text-xs">
            {remaining} task{remaining !== 1 ? "s" : ""} remaining
          </p>
        </>
      )}
    </main>
  );
}
