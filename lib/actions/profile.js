"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { validateProfileInput } from "@/lib/validation";

// プロフィール（留学先・期間）を更新する。
// これから投稿するときのバッジに使われる。過去の投稿のバッジは投稿時点のまま変わらない。
export async function updateProfile(input) {
  const { errors, values } = validateProfileInput(input ?? {});
  if (Object.keys(errors).length > 0) return { fieldErrors: errors };

  const user = await getCurrentUser();
  if (!user) return { error: "ログインが必要です。" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .update({ study_country: values.studyCountry, study_months: values.studyMonths })
    .eq("id", user.id)
    .select("study_country, study_months");

  if (error || data.length === 0) {
    console.error("updateProfile:", error?.message);
    return { error: "保存できませんでした。もう一度お試しください。" };
  }

  revalidatePath("/", "layout"); // ヘッダーの投稿フォームのバッジ表示も更新する
  return { ok: true };
}
