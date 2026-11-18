import Link from "next/link";
import { Globe } from "lucide-react";

// 画面上部に固定されるヘッダー（ログインボタン・投稿ボタンは後のフェーズで追加）
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full font-display text-lg font-bold"
        >
          <Globe aria-hidden="true" className="h-5 w-5 text-accent" />
          Culture Shock Share
        </Link>
      </div>
    </header>
  );
}
