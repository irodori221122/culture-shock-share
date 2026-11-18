"use client";

import { useEffect, useId, useRef } from "react";
import { X } from "lucide-react";

// 汎用のモーダル（ダイアログ）。閉じても中身は消さない（書きかけの入力を残すため）。
// HTML 標準の <dialog> を showModal() で開くと、ブラウザが次のことをしてくれる:
//   ・背景の操作を無効にし、Tab のフォーカスをダイアログ内に閉じ込める
//   ・Esc キーで閉じる
//   ・閉じたら、開く前にフォーカスしていたボタンにフォーカスを戻す
// 見た目（スマホではボトムシート、背景のぼかし、開閉の動き）は globals.css の .modal に書いてある。
export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null);
  // 同じページにモーダルが複数あっても id が重ならないよう、React に一意な id を作ってもらう
  const titleId = useId();

  // open の true / false に合わせて、実際の <dialog> を開け閉めする
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
      // data-autofocus を付けた入力欄があれば、そこから入力を始められるようにする
      dialog.querySelector("[data-autofocus]")?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      // Esc などで閉じられたときも、親の状態（open）を false に戻す
      onClose={onClose}
      aria-labelledby={titleId}
      className="modal"
    >
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <h2 id={titleId} className="font-display text-lg font-bold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="閉じる"
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-background hover:text-ink"
        >
          <X aria-hidden="true" className="h-5 w-5" />
        </button>
      </div>
      <div className="max-h-[calc(100dvh-8rem)] overflow-y-auto px-5 py-5">
        {children}
      </div>
    </dialog>
  );
}
