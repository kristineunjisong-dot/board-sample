import { NextResponse } from "next/server";
import { kv } from "@vercel/kv";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Comment = {
  id: string;
  postId: string;
  author: string;
  body: string;
  createdAt: number;
};

const commentsKey = (postId: string) => `post:${postId}:comments`;

export async function POST(
  request: Request,
  { params }: { params: { postId: string } },
) {
  const postId = params.postId;
  if (!postId) {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { author, body } = (payload ?? {}) as {
    author?: string;
    body?: string;
  };

  const trimmedAuthor = (author ?? "").trim();
  const trimmedBody = (body ?? "").trim();

  if (!trimmedAuthor || !trimmedBody) {
    return NextResponse.json(
      { error: "작성자명과 내용을 입력해주세요." },
      { status: 400 },
    );
  }

  if (trimmedAuthor.length > 40 || trimmedBody.length > 1000) {
    return NextResponse.json(
      { error: "입력 길이가 너무 깁니다." },
      { status: 400 },
    );
  }

  const comment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    postId,
    author: trimmedAuthor,
    body: trimmedBody,
    createdAt: Date.now(),
  };

  try {
    await kv.rpush(commentsKey(postId), comment);
  } catch {
    return NextResponse.json(
      { error: "저장소 연결이 필요합니다." },
      { status: 503 },
    );
  }

  return NextResponse.json({ comment }, { status: 201 });
}
