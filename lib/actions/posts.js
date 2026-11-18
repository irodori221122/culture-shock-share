"use server";

import { revalidatePath } from "next/cache";
import { fetchPosts, normalizeFeedParams } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";
import { validatePostInput } from "@/lib/validation";

// Server Action: ブラウザから呼ばれ、サーバー上で動く関数。
// 引数はブラウザから届く＝改ざんされうる値なので、ここで必ずチェックする。

// 「もっと見る」で次の 20 件を取ってくる
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

// 投稿を保存する
export async function createPost(input) {
  const { errors, values } = validatePostInput(input ?? {});
  if (Object.keys(errors).length > 0) {
    return { fieldErrors: errors };
  }

  const supabase = await createClient();

  const { error } = await supabase.from("posts").insert({
    // ログインなしの投稿は user_id を空（NULL）にする
    user_id: null,
    country: values.country,
    genre: values.genre,
    tag: values.tag,
    content: values.content,
  });

  if (error) {
    console.error("createPost:", error.message);
    return { error: "投稿できませんでした。時間をおいてもう一度お試しください。" };
  }

  // トップページのキャッシュを捨てて、次の表示で新しい投稿が出るようにする
  revalidatePath("/");
  return { ok: true };
}
