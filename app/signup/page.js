import Link from "next/link";
import { redirect } from "next/navigation";
import SignUpForm from "@/components/SignUpForm";
import { getCurrentUser } from "@/lib/auth";

export const metadata = {
  title: "新規登録",
  description: "Culture Shock Share に登録して、留学バッジ付きで投稿しましょう。",
};

export default async function SignUpPage() {
  // すでにログインしていればトップへ
  if (await getCurrentUser()) redirect("/");

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-10 sm:py-14">
      <div className="rounded-card border border-border bg-surface p-6 sm:p-8">
        <h1 className="font-display text-2xl font-bold">新規登録</h1>
        <p className="mt-2 text-sm text-muted">
          投稿はいつでも匿名です。登録すると、投稿に留学バッジを付けられます。
        </p>
        <div className="mt-6">
          <SignUpForm />
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          登録済みの方は{" "}
          <Link href="/login" className="font-medium text-accent-ink underline underline-offset-4">
            ログイン
          </Link>
        </p>
      </div>
    </main>
  );
}
