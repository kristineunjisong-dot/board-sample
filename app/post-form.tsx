"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function PostForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [author, setAuthor] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body, author }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "글 작성에 실패했습니다.");
      return;
    }

    setTitle("");
    setBody("");
    setAuthor("");
    startTransition(() => router.refresh());
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 className="text-lg font-semibold">새 글 쓰기</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          type="text"
          placeholder="작성자명"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          maxLength={40}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <input
          type="text"
          placeholder="제목"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={120}
          required
          className="rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>
      <textarea
        placeholder="본문을 입력하세요"
        value={body}
        onChange={(event) => setBody(event.target.value)}
        maxLength={4000}
        required
        rows={5}
        className="w-full rounded-lg border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
      />
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "등록 중..." : "글 등록"}
        </button>
      </div>
    </form>
  );
}
