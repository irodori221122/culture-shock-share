"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser, getMyProfile } from "@/lib/auth";
import { fetchPosts, normalizeFeedParams } from "@/lib/posts";
import { createClient } from "@/lib/supabase/server";
import { isUuid, validatePostInput } from "@/lib/validation";

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

  // ログインしていれば自分の投稿として保存する。していなければ user_id は空（NULL）
  const user = await getCurrentUser();
  const row = {
    user_id: user ? user.id : null,
    country: values.country,
    genre: values.genre,
    tag: values.tag,
    content: values.content,
  };

  // 「留学バッジを付ける」がオンなら、自分のプロフィールの値を添える。
  // （念のため DB のトリガーも、本人のプロフィールの値で上書きする）
  if (user && input.withBadge === true) {
    const profile = await getMyProfile();
    if (profile) {
      row.author_study_country = profile.study_country;
      row.author_study_months = profile.study_months;
    }
  }

  const { error } = await supabase.from("posts").insert(row);

  if (error) {
    console.error("createPost:", error.message);
    return { error: "投稿できませんでした。時間をおいてもう一度お試しください。" };
  }

  // トップページのキャッシュを捨てて、次の表示で新しい投稿が出るようにする
  revalidatePath("/");
  return { ok: true };
}

// 自分の投稿を削除する。
// RLS で「user_id = 自分」の行しか消せないので、他人の投稿の ID を送られても何も消えない。
// リアクションと通報は、DB の外部キー（ON DELETE CASCADE）で一緒に消える。
export async function deletePost({ postId }) {
  if (!isUuid(postId)) {
    return { error: "削除できませんでした。" };
  }
  const user = await getCurrentUser();
  if (!user) return { error: "削除にはログインが必要です。" };

  const supabase = await createClient();
  // .select("id") を付けると、実際に消えた行が返ってくる（0 件なら消えていない）
  const { data, error } = await supabase
    .from("posts")
    .delete()
    .eq("id", postId)
    .select("id");

  if (error) {
    console.error("deletePost:", error.message);
    return { error: "削除できませんでした。もう一度お試しください。" };
  }
  if (data.length === 0) {
    return { error: "この投稿は削除できません。" };
  }

  revalidatePath("/");
  revalidatePath("/me");
  return { ok: true };
}
