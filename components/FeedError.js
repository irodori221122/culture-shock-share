"use client";

import { useTransition } from "react";
import { CircleAlert, RotateCw } from "lucide-react";
import { useRouter } from "next/navigation";

// 一覧の取得に失敗したときの表示。「再読み込み」でサーバーにもう一度取りに行く。
export default function FeedError() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <div
      role="alert"
      className="rounded-card border border-border bg-surface px-6 py-14 text-center"
    >
      <CircleAlert aria-hidden="true" className="mx-auto h-8 w-8 text-danger" />
      <p className="mt-4 font-display font-bold">投稿を読み込めませんでした</p>
      <p className="mt-1 text-sm text-muted">
        通信状況を確認して、もう一度お試しください。
      </p>
      <button
        type="button"
        onClick={() => startTransition(() => router.refresh())}
        disabled={isPending}
        className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-background px-6 text-sm font-medium hover:bg-surface disabled:opacity-60"
      >
        <RotateCw
          aria-hidden="true"
          className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`}
        />
        再読み込み
      </button>
    </div>
  );
}
