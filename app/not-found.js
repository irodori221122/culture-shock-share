import Link from "next/link";
import { Compass } from "lucide-react";

export const metadata = {
  title: "ページが見つかりません",
};

// 存在しない URL を開いたときの 404 ページ
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <Compass aria-hidden="true" className="h-10 w-10 text-accent" />
      <h1 className="mt-4 font-display text-2xl font-bold">ページが見つかりません</h1>
      <p className="mt-2 text-sm text-muted">
        URL が間違っているか、ページが移動・削除された可能性があります。
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex min-h-11 items-center rounded-full bg-accent px-6 font-medium text-ink hover:bg-accent-hover"
      >
        トップページへ
      </Link>
    </main>
  );
}
