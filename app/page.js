import { Suspense } from "react";
import FilterBar from "@/components/FilterBar";
import Hero from "@/components/Hero";
import PostFeed from "@/components/PostFeed";
import PostListSkeleton from "@/components/PostListSkeleton";
import { normalizeFeedParams } from "@/lib/posts";

export const metadata = {
  // title を書かないと layout.js の title.default（Culture Shock Share）が使われる
  description:
    "留学生が体験したカルチャーショックの一覧。国やリアクションの多さで絞り込み・並び替えができます。",
};

// トップページ（投稿一覧）。URL の ?country= と ?sort= で表示を切り替える。
export default async function Home({ searchParams }) {
  const { country, sort } = normalizeFeedParams(await searchParams);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4">
      <Hero />
      <FilterBar country={country} sort={sort} />
      <div className="mt-2">
        {/*
          Suspense: 中身（PostFeed）がデータを取り終わるまで fallback を出す。
          key を条件ごとに変えることで、国や並び順を変えたときにもスケルトンを出し直す。
        */}
        <Suspense key={`${country}-${sort}`} fallback={<PostListSkeleton />}>
          <PostFeed country={country} sort={sort} />
        </Suspense>
      </div>
    </main>
  );
}
