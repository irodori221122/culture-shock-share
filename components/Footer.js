import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-border">
      {/* スマホでは右下の「投稿する」ボタンと重ならないよう、下に余白を取る */}
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-4 pb-24 pt-8 text-sm text-muted sm:flex-row sm:justify-between sm:pb-8">
        <Link href="/guidelines" className="underline-offset-4 hover:underline">
          利用ガイドライン
        </Link>
        <p>&copy; 2026 Culture Shock Share</p>
      </div>
    </footer>
  );
}
