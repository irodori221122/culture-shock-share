"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { REPORT_DETAIL_MAX_LENGTH, isValidReportReason } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { countChars, isUuid } from "@/lib/validation";

// 投稿を通報する。
// 件数の加算と「3 件で非表示」は DB のトリガーが行う。
// 1 人 1 回までは DB の UNIQUE 制約、自分の投稿を通報できないのは RLS が守る。
export async function reportPost({ postId, reason, detail }) {
  if (!isUuid(postId)) {
    return { error: "通報できませんでした。" };
  }
  if (!isValidReportReason(reason)) {
    return { fieldErrors: { reason: "通報理由を選んでください" } };
  }

  // 補足は「その他」のときだけ受け付ける（任意・200 文字まで）
  const trimmedDetail = reason === "other" && typeof detail === "string" ? detail.trim() : "";
  if (countChars(trimmedDetail) > REPORT_DETAIL_MAX_LENGTH) {
    return { fieldErrors: { detail: `${REPORT_DETAIL_MAX_LENGTH}文字以内で入力してください` } };
  }

  const user = await getCurrentUser();
  if (!user) return { error: "通報にはログインが必要です。", needsLogin: true };

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    post_id: postId,
    user_id: user.id,
    reason,
    detail: trimmedDetail || null,
  });

  if (error) {
    // 23505 = UNIQUE 制約違反（同じ投稿をもう通報している）
    if (error.code === "23505") return { error: "この投稿は通報済みです。" };
    // 42501 = RLS で拒否（自分の投稿）
    if (error.code === "42501") return { error: "自分の投稿は通報できません。" };
    console.error("reportPost:", error.code, error.message);
    return { error: "通報できませんでした。もう一度お試しください。" };
  }

  // 通報で非表示になったかを確かめる（非表示になると RLS で読めなくなる）
  const { data: stillVisible } = await supabase
    .from("posts")
    .select("id")
    .eq("id", postId)
    .eq("is_hidden", false)
    .maybeSingle();

  revalidatePath("/");
  return { ok: true, hidden: !stillVisible };
}
