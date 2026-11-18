"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Ellipsis, Flag, Trash2 } from "lucide-react";
import DeleteDialog from "@/components/DeleteDialog";
import LoginRequiredDialog from "@/components/LoginRequiredDialog";
import ReportDialog from "@/components/ReportDialog";
import Toast from "@/components/Toast";

// 投稿カードの「⋯」メニュー。
//   自分の投稿 → 「削除する」 / 他人の投稿 → 「通報する」（自分の投稿は通報できないので出さない）
// onRemoved(message) … 削除や非表示で、このカードを一覧から消すときに呼ぶ
export default function PostMenu({ postId, isMine, isLoggedIn, onRemoved }) {
  const [isOpen, setIsOpen] = useState(false);
  // どのダイアログを開いているか: "report" / "delete" / "login" / null
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState("");
  const closeToast = useCallback(() => setToast(""), []);
  const containerRef = useRef(null);
  const buttonRef = useRef(null);

  // メニューの外をクリック、または Esc キーで閉じる
  useEffect(() => {
    if (!isOpen) return;
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openDialog(name) {
    setIsOpen(false);
    setDialog(name);
  }

  const itemClass =
    "flex min-h-11 w-full items-center gap-2 whitespace-nowrap rounded-xl px-3 text-left text-sm hover:bg-background";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="投稿のメニュー"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-background hover:text-ink"
      >
        <Ellipsis aria-hidden="true" className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="animate-fade-in absolute bottom-full right-0 z-10 mb-1 rounded-2xl border border-border bg-surface p-1.5 shadow-lg">
          {isMine ? (
            <button type="button" onClick={() => openDialog("delete")} className={`${itemClass} text-danger`}>
              <Trash2 aria-hidden="true" className="h-4 w-4" />
              削除する
            </button>
          ) : (
            <button
              type="button"
              onClick={() => openDialog(isLoggedIn ? "report" : "login")}
              className={itemClass}
            >
              <Flag aria-hidden="true" className="h-4 w-4" />
              通報する
            </button>
          )}
        </div>
      )}

      {isMine ? (
        <DeleteDialog
          postId={postId}
          open={dialog === "delete"}
          onClose={() => setDialog(null)}
          onDeleted={() => {
            setDialog(null);
            onRemoved("削除しました");
          }}
        />
      ) : isLoggedIn ? (
        <ReportDialog
          postId={postId}
          open={dialog === "report"}
          onClose={() => setDialog(null)}
          onReported={({ hidden }) => {
            setDialog(null);
            if (hidden) {
              onRemoved("通報しました。この投稿は非表示になりました");
            } else {
              setToast("通報しました。ご協力ありがとうございます");
            }
          }}
        />
      ) : (
        <LoginRequiredDialog
          open={dialog === "login"}
          onClose={() => setDialog(null)}
          message="通報にはログインが必要です"
        />
      )}

      <Toast message={toast} onClose={closeToast} />
    </div>
  );
}
