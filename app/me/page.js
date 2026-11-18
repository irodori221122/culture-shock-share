import { redirect } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { getCurrentUser, getMyProfile } from "@/lib/auth";
import { getCountryLabel } from "@/lib/constants";

export const metadata = {
  title: "マイページ",
  description: "プロフィールと自分の投稿の管理。",
};

// マイページ（ログイン必須）。プロフィール編集と自分の投稿一覧は Phase 6 で追加する。
export default async function MyPage() {
  // ログインしていなければログインページへ（ログイン後はここに戻ってくる）
  if (!(await getCurrentUser())) redirect("/login?next=/me");
  const profile = await getMyProfile();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="font-display text-2xl font-bold">マイページ</h1>
      <section className="mt-6 rounded-card border border-border bg-surface p-6">
        <h2 className="font-display text-lg font-bold">プロフィール</h2>
        {profile ? (
          <p className="mt-3 inline-flex items-center gap-1.5 text-sm">
            <GraduationCap aria-hidden="true" className="h-4 w-4 text-muted" />
            {getCountryLabel(profile.study_country)}留学{profile.study_months}ヶ月
          </p>
        ) : (
          <p className="mt-3 text-sm text-muted">プロフィールを読み込めませんでした。</p>
        )}
      </section>
    </main>
  );
}
