import { kv } from "@vercel/kv";
import PostForm from "./post-form";
import CommentForm from "./comment-form";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type Post = {
  id: string;
  title: string;
  body: string;
  author: string;
  createdAt: number;
};

type Comment = {
  id: string;
  postId: string;
  author: string;
  body: string;
  createdAt: number;
};

type PostWithComments = Post & { comments: Comment[] };

const POSTS_KEY = "posts:all";
const commentsKey = (postId: string) => `post:${postId}:comments`;

async function getPostsWithComments(): Promise<PostWithComments[]> {
  try {
    const posts = (await kv.lrange<Post>(POSTS_KEY, 0, -1)) ?? [];
    if (posts.length === 0) return [];
    const commentLists = await Promise.all(
      posts.map(async (post) => {
        try {
          return (
            (await kv.lrange<Comment>(commentsKey(post.id), 0, -1)) ?? []
          );
        } catch {
          return [];
        }
      }),
    );
    return posts.map((post, i) => ({ ...post, comments: commentLists[i] }));
  } catch {
    return [];
  }
}

function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function HomePage() {
  const posts = await getPostsWithComments();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">초미니 게시판</h1>
        <p className="mt-1 text-sm text-slate-600">
          누구나 링크로 접속해 글을 남길 수 있는 샘플 게시판입니다.
        </p>
      </header>

      <PostForm />

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">
          전체 글 <span className="text-slate-500">({posts.length})</span>
        </h2>

        {posts.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
            아직 글이 없습니다. 첫 글을 남겨보세요.
          </p>
        ) : (
          <ul className="space-y-3">
            {posts.map((post) => (
              <li
                key={post.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-1 flex items-center justify-between gap-3">
                  <h3 className="text-base font-semibold">{post.title}</h3>
                  <span className="whitespace-nowrap text-xs text-slate-500">
                    {formatDate(post.createdAt)}
                  </span>
                </div>
                <p className="mb-2 text-xs text-slate-500">by {post.author}</p>
                <p className="whitespace-pre-wrap text-sm text-slate-800">
                  {post.body}
                </p>

                <div className="mt-4 border-t border-slate-100 pt-3">
                  <p className="mb-2 text-xs font-semibold text-slate-600">
                    댓글{" "}
                    {post.comments.length > 0
                      ? `(${post.comments.length})`
                      : ""}
                  </p>
                  {post.comments.length > 0 ? (
                    <ul className="space-y-2">
                      {post.comments.map((comment) => (
                        <li
                          key={comment.id}
                          className="rounded-md bg-slate-50 px-3 py-2 text-xs"
                        >
                          <div className="text-slate-500">
                            <span className="font-medium text-slate-700">
                              {comment.author}
                            </span>
                            <span> · {formatDate(comment.createdAt)}</span>
                          </div>
                          <p className="mt-1 whitespace-pre-wrap text-slate-800">
                            {comment.body}
                          </p>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400">
                      아직 댓글이 없습니다.
                    </p>
                  )}
                  <CommentForm postId={post.id} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <footer className="mt-10 text-center text-xs text-slate-400">
        Next.js + Vercel KV · deep-interview → autopilot
      </footer>
    </main>
  );
}
