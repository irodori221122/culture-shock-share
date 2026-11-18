"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import Modal from "@/components/Modal";
import { deletePost } from "@/lib/actions/posts";

// 削除の確認ダイアログ。「削除する」を押したときだけ実際に消す。
// onDeleted … 削除できたら呼ぶ
export default function DeleteDialog({ postId, open, onClose, onDeleted }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    setError("");
    startTransition(async () => {
      let result;
      try {
        result = await deletePost({ postId });
      } catch {
        setError("通信に失敗しました。もう一度お試しください。");
        return;
      }
      if (result.error) setError(result.error);
      else onDeleted();
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="この投稿を削除しますか？">
      <p className="text-sm leading-relaxed text-muted">
        元に戻せません。付いているリアクションも一緒に消えます。
      </p>
      {error && (
        <p role="alert" className="mt-4 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        {/* 誤操作を防ぐため、最初のフォーカスは「キャンセル」に置く */}
        <button
          type="button"
          data-autofocus
          onClick={onClose}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 font-medium hover:bg-background"
        >
          キャンセル
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-danger px-6 font-medium text-surface hover:opacity-90 disabled:opacity-60"
        >
          {isPending && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
          {isPending ? "削除中…" : "削除する"}
        </button>
      </div>
    </Modal>
  );
}
