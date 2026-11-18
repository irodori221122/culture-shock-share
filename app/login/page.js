import Link from "next/link";
import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "ログイン",
  description: "Culture Shock Share にログインして、リアクションや通報、投稿の管理をしましょう。",
};

export default async function LoginPage({ searchParams }) {
  // すでにログインしていればトップへ
  if (await getCurrentUser()) redirect("/");

  const { next } = await searchParams;

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:py-14">
      <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">ログイン</h1>
        <p className="mt-2 text-sm text-muted">
          ログインすると、リアクション・通報・自分の投稿の削除ができます。
        </p>
        <div className="mt-6">
          <LoginForm next={typeof next === "string" ? next : "/"} />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          はじめての方は{" "}
          <Link href="/signup" className="font-medium text-accent-ink underline underline-offset-4">
            新規登録
          </Link>
        </p>
      </div>
    </main>
  );
}
