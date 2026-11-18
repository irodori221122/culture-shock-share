"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { CircleUser, LogOut, User } from "lucide-react";
import { signOut } from "@/lib/actions/auth";

// ログイン中のユーザーメニュー（マイページ・ログアウト）。
// 匿名性のため、メールアドレスなどの個人情報はここにも出さない。
export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
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
        buttonRef.current?.focus(); // フォーカスをメニューのボタンに戻す
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const itemClass =
    "flex min-h-11 w-full items-center gap-2 rounded-xl px-3 text-left text-sm hover:bg-background";

  return (
    <div ref={containerRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="ユーザーメニュー"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface hover:bg-background"
      >
        <CircleUser aria-hidden="true" className="h-5 w-5" />
      </button>

      {isOpen && (
        <div className="animate-fade-in absolute right-0 top-full mt-2 w-48 rounded-2xl border border-border bg-surface p-1.5 shadow-lg">
          <Link href="/me" onClick={() => setIsOpen(false)} className={itemClass}>
            <User aria-hidden="true" className="h-4 w-4" />
            マイページ
          </Link>
          <button
            type="button"
            disabled={isPending}
            onClick={() => startTransition(() => signOut())}
            className={`${itemClass} disabled:opacity-60`}
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            {isPending ? "ログアウト中…" : "ログアウト"}
          </button>
        </div>
      )}
    </div>
  );
}
