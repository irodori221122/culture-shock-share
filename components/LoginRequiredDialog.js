"use client";

import Link from "next/link";
import Modal from "@/components/Modal";

// 「ログインが必要です」のダイアログ。未ログインでリアクション・通報を押したときに出す。
// message には「リアクションにはログインが必要です」などを渡す。
export default function LoginRequiredDialog({ open, onClose, message }) {
  return (
    <Modal open={open} onClose={onClose} title={message}>
      <p className="text-sm leading-relaxed text-muted">
        ログインすると、投稿へのリアクションや通報、自分の投稿の削除ができます。投稿は今までどおり匿名で表示されます。
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/login"
          data-autofocus
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-accent px-6 font-medium text-ink hover:bg-accent-hover"
        >
          ログイン
        </Link>
        <Link
          href="/signup"
          className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full border border-border px-6 font-medium hover:bg-background"
        >
          新規登録
        </Link>
      </div>
    </Modal>
  );
}
