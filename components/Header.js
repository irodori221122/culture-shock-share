import Link from "next/link";
import { Globe } from "lucide-react";
import NewPostButton from "@/components/NewPostButton";

// 画面上部に固定されるヘッダー（ログインボタンは後のフェーズで追加）
// 注意: ここに backdrop-blur（背景ぼかし）を付けると、中の position: fixed の要素
// （トーストなど）が画面ではなくヘッダー基準で配置されてしまうので付けない。
export default function Header() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full font-display text-lg font-bold"
        >
          <Globe aria-hidden="true" className="h-5 w-5 text-accent" />
          Culture Shock Share
        </Link>
        <div className="flex items-center gap-2">
          {/* PC 用の「投稿する」。スマホ用は右下に浮かぶボタン（app/layout.js） */}
          <NewPostButton variant="header" />
        </div>
      </div>
    </header>
  );
}
