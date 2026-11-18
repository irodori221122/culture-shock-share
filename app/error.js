"use client";

import { CircleAlert, RotateCw } from "lucide-react";

// 想定外のエラーが起きたときの画面（Next.js の決まりで、Client Component にする）。
// reset を呼ぶと、そのページをもう一度表示し直す。
export default function Error({ reset }) {
  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-4 py-20 text-center">
      <CircleAlert aria-hidden="true" className="h-10 w-10 text-danger" />
      <h1 className="mt-4 font-display text-2xl font-bold">エラーが発生しました</h1>
      <p className="mt-2 text-sm text-muted">
        時間をおいて、もう一度お試しください。
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-surface px-6 font-medium hover:bg-background"
      >
        <RotateCw aria-hidden="true" className="h-4 w-4" />
        再読み込み
      </button>
    </main>
  );
}
