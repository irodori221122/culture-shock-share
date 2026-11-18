import Link from "next/link";
import { Globe, LogIn } from "lucide-react";
import NewPostButton from "@/components/NewPostButton";
import UserMenu from "@/components/UserMenu";
import { getMyProfile } from "@/lib/auth";

// 画面上部に固定されるヘッダー（Server Component）。
// サーバーでログイン状態を調べて、「ログイン」ボタンかユーザーメニューを出し分ける。
// 注意: ここに backdrop-blur（背景ぼかし）を付けると、中の position: fixed の要素
// （トーストなど）が画面ではなくヘッダー基準で配置されてしまうので付けない。
export default async function Header() {
  // ログインしていなければ null
  const profile = await getMyProfile();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-2 px-4">
        <Link
          href="/"
          className="inline-flex min-w-0 items-center gap-1.5 rounded-full font-display text-lg font-bold"
        >
          <Globe aria-hidden="true" className="h-5 w-5 shrink-0 text-accent" />
          <span className="truncate">Culture Shock Share</span>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          {/* PC 用の「投稿する」。スマホ用は右下に浮かぶボタン（app/layout.js） */}
          <NewPostButton variant="header" profile={profile} />
          {profile ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border bg-surface px-4 text-sm font-medium hover:bg-background"
            >
              <LogIn aria-hidden="true" className="h-4 w-4" />
              ログイン
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
