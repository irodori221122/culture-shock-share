"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import PostCard from "@/components/PostCard";
import { loadMorePosts } from "@/lib/actions/posts";

// 投稿カードの一覧と「もっと見る」ボタン。
// 最初の 20 件はサーバーで取得済みのものを受け取り、続きはボタンで追加していく。
export default function PostList({ initialPosts, initialHasMore, country, sort, isLoggedIn }) {
  const [posts, setPosts] = useState(initialPosts);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  // 投稿などのあと、サーバーから「最新の 1 ページ目」が届き直すことがある。
  // そのまま置き換えると「もっと見る」で読んだ分が消えるので、
  // 最新の 1 ページ目 ＋ それ以外に読み込み済みの投稿、の順に合体させる。
  // （前回届いた値と比べて、変わったときだけ合体する。React 公式の書き方）
  const [prevInitialPosts, setPrevInitialPosts] = useState(initialPosts);
  if (initialPosts !== prevInitialPosts) {
    setPrevInitialPosts(initialPosts);
    const freshIds = new Set(initialPosts.map((post) => post.id));
    const extras = posts.filter((post) => !freshIds.has(post.id));
    setPosts([...initialPosts, ...extras]);
  }

  function handleLoadMore() {
    setError("");
    startTransition(async () => {
      let result;
      try {
        result = await loadMorePosts({ country, sort, offset: posts.length });
      } catch {
        result = { error: "通信に失敗しました。もう一度お試しください。" };
      }
      if (result.error) {
        setError(result.error);
        return;
      }
      // 読み込みの間に新しい投稿が増えると、同じ投稿が重なって届くことがあるので除く
      setPosts((current) => {
        const seen = new Set(current.map((post) => post.id));
        return [...current, ...result.posts.filter((post) => !seen.has(post.id))];
      });
      setHasMore(result.hasMore);
    });
  }

  return (
    <div>
      <ul className="flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.id}>
            <PostCard post={post} isLoggedIn={isLoggedIn} />
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="mt-6 text-center text-sm text-danger">
          {error}
        </p>
      )}

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isPending}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-6 text-sm font-medium transition-colors hover:bg-background disabled:opacity-60"
          >
            {isPending && (
              <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
            )}
            {isPending ? "読み込み中…" : "もっと見る"}
          </button>
        </div>
      )}
    </div>
  );
}
