import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

// 今ログインしている人を調べる（サーバー専用）。ログインしていなければ null。
// getClaims は、ログイン情報（JWT）の署名を検証してから中身を返すので、偽造を見抜ける。
// cache で包むと、1 回のページ表示の中で何度呼んでも、実際の確認は 1 回で済む。
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  return { id: data.claims.sub };
});

// 自分のプロフィール（留学先・期間）。RLS により本人の行しか読めない。
export const getMyProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("study_country, study_months")
    .eq("id", user.id)
    .maybeSingle();
  return data;
});
