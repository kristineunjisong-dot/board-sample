"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export default function CommentForm({ postId }: { postId: string }) {
  const router = useRouter();
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/posts/${postId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author, body }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
      };
      setError(data.error ?? "댓글 작성에 실패했습니다.");
      return;
    }

    setAuthor("");
    setBody("");
    startTransition(() => router.refresh());
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="이름"
          value={author}
          onChange={(event) => setAuthor(event.target.value)}
          maxLength={40}
          required
          className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <input
          type="text"
          placeholder="댓글 달기"
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={1000}
          required
          className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-700 disabled:opacity-50"
        >
          {pending ? "..." : "등록"}
        </button>
      </div>
      {error ? <p className="text-xs text-red-600">{error}</p> : null}
    </form>
  );
}
