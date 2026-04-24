import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const redis = new Redis({
  url:
    process.env.UPSTASH_REDIS_REST_URL ??
    process.env.KV_REST_API_URL ??
    "",
  token:
    process.env.UPSTASH_REDIS_REST_TOKEN ??
    process.env.KV_REST_API_TOKEN ??
    "",
});

type Post = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: number;
};

const POSTS_KEY = "posts:all";

export async function GET() {
  try {
    const posts = (await redis.lrange<Post>(POSTS_KEY, 0, -1)) ?? [];
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json({ posts: [] });
  }
}

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const { title, body, author } = (payload ?? {}) as {
    title?: string;
    body?: string;
    author?: string;
  };

  const trimmedTitle = (title ?? "").trim();
  const trimmedBody = (body ?? "").trim();
  const trimmedAuthor = (author ?? "").trim();

  if (!trimmedTitle || !trimmedBody || !trimmedAuthor) {
    return NextResponse.json(
      { error: "제목, 본문, 작성자명을 모두 입력해주세요." },
      { status: 400 },
    );
  }

  if (
    trimmedTitle.length > 120 ||
    trimmedAuthor.length > 40 ||
    trimmedBody.length > 4000
  ) {
    return NextResponse.json(
      { error: "입력 길이가 너무 깁니다." },
      { status: 400 },
    );
  }

  const post: Post = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: trimmedTitle,
    body: trimmedBody,
    author: trimmedAuthor,
    createdAt: Date.now(),
  };

  try {
    await redis.lpush(POSTS_KEY, post);
  } catch {
    return NextResponse.json(
      { error: "저장소 연결이 필요합니다 (Upstash Redis)." },
      { status: 503 },
    );
  }

  return NextResponse.json({ post }, { status: 201 });
}
