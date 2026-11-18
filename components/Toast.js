"use client";

import { useEffect } from "react";
import { CircleCheck, CircleAlert } from "lucide-react";

// 画面下部の中央に数秒だけ出る通知。
// message が空なら何も出さない。数秒たつと onClose を呼んで消してもらう。
export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const Icon = type === "error" ? CircleAlert : CircleCheck;

  return (
    // role="status" にすると、スクリーンリーダーが内容を読み上げてくれる
    <div
      role="status"
      className="animate-toast-in fixed inset-x-0 bottom-6 z-50 mx-auto flex w-fit max-w-[calc(100%-2rem)] items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm text-surface shadow-lg"
    >
      <Icon
        aria-hidden="true"
        className={`h-4 w-4 shrink-0 ${type === "error" ? "text-accent" : "text-mint-strong"}`}
      />
      {message}
    </div>
  );
}
