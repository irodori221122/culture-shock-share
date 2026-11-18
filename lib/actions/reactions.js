"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { REACTION_TYPES } from "@/lib/constants";

// UUID の形かどうか（ブラウザから届く投稿 ID のチェック用）
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// リアクションを「この状態にしてほしい」と指定して保存する Server Action。
//   reaction: "empathy"（共感） / "discovery"（発見） / null（取り消し）
// 「押した種類」ではなく「押した後の状態」を受け取るので、連打しても結果がずれない。
// 件数（posts.empathy_count など）は DB のトリガーが増減させるので、ここでは触らない。
export async function setReaction({ postId, reaction }) {
  if (typeof postId !== "string" || !UUID_PATTERN.test(postId)) {
    return { error: "リアクションできませんでした。" };
  }
  if (reaction !== null && !REACTION_TYPES.includes(reaction)) {
    return { error: "リアクションできませんでした。" };
  }

  const user = await getCurrentUser();
  if (!user) {
    return { error: "リアクションにはログインが必要です。", needsLogin: true };
  }

  const supabase = await createClient();

  // 今付いている自分のリアクションを調べる
  const { data: current, error: readError } = await supabase
    .from("reactions")
    .select("type")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (readError) return failed(readError);

  let error = null;
  if (reaction === null) {
    // 取り消し
    if (current) {
      ({ error } = await supabase
        .from("reactions")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", user.id));
    }
  } else if (!current) {
    // 新しく付ける
    ({ error } = await supabase
      .from("reactions")
      .insert({ post_id: postId, user_id: user.id, type: reaction }));
  } else if (current.type !== reaction) {
    // もう一方から切り替える
    ({ error } = await supabase
      .from("reactions")
      .update({ type: reaction })
      .eq("post_id", postId)
      .eq("user_id", user.id));
  }
  if (error) return failed(error);

  // 最新の件数を返す（画面の数字を DB の値に合わせるため）
  const { data: counts } = await supabase
    .from("posts")
    .select("empathy_count, discovery_count")
    .eq("id", postId)
    .maybeSingle();

  revalidatePath("/");
  revalidatePath("/me");
  return {
    ok: true,
    reaction,
    empathyCount: counts?.empathy_count,
    discoveryCount: counts?.discovery_count,
  };
}

function failed(error) {
  console.error("setReaction:", error.message);
  return { error: "リアクションできませんでした。もう一度お試しください。" };
}
