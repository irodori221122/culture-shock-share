"use server";

import { fetchPosts, normalizeFeedParams } from "@/lib/posts";

// Server Action: ブラウザのボタンから呼ばれ、サーバー上で動く関数。
// 「もっと見る」で次の 20 件を取ってくる。
export async function loadMorePosts({ country, sort, offset }) {
  const params = normalizeFeedParams({ country, sort });

  // offset もブラウザから届く値なので、0 以上の整数であることを確かめる
  if (!Number.isInteger(offset) || offset < 0) {
    return { error: "読み込みに失敗しました。" };
  }

  try {
    return await fetchPosts({ ...params, offset });
  } catch {
    return { error: "読み込みに失敗しました。もう一度お試しください。" };
  }
}
