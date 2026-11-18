import EmptyState from "@/components/EmptyState";
import FeedError from "@/components/FeedError";
import PostList from "@/components/PostList";
import { fetchPosts } from "@/lib/posts";

// 投稿一覧の「データを取ってくる係」（Server Component）。
// サーバー上で最初の 20 件を取得し、結果に応じて 一覧 / 0 件 / エラー を出し分ける。
export default async function PostFeed({ country, sort }) {
  let result;
  try {
    result = await fetchPosts({ country, sort, offset: 0 });
  } catch (error) {
    console.error(error);
    return <FeedError />;
  }

  if (result.posts.length === 0) {
    return <EmptyState />;
  }

  return (
    <PostList
      initialPosts={result.posts}
      initialHasMore={result.hasMore}
      country={country}
      sort={sort}
    />
  );
}
