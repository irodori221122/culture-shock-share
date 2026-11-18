"use client";

import { useCallback, useState } from "react";
import { PenLine } from "lucide-react";
import Modal from "@/components/Modal";
import PostForm from "@/components/PostForm";
import Toast from "@/components/Toast";

// ボタンの見た目は置き場所ごとに変える
const VARIANT_CLASS = {
  // PC のヘッダー（スマホでは隠す）
  header:
    "hidden sm:inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent px-5 text-sm font-medium text-ink hover:bg-accent-hover",
  // スマホの右下に浮かぶボタン（PC では隠す）
  fab:
    "sm:hidden fixed bottom-5 right-5 z-30 inline-flex h-14 items-center gap-1.5 rounded-full bg-accent px-5 font-medium text-ink shadow-lg hover:bg-accent-hover",
  // 0 件のときの案内の中
  inline:
    "inline-flex min-h-11 items-center gap-1.5 rounded-full bg-accent px-5 text-sm font-medium text-ink hover:bg-accent-hover",
};

// 「投稿する」ボタン。押すと投稿モーダルが開き、成功したらトーストを出す。
export default function NewPostButton({ variant = "header" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [toast, setToast] = useState("");

  // Toast に渡す関数は毎回作り直さないようにする（タイマーがリセットされないように）
  const closeToast = useCallback(() => setToast(""), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={VARIANT_CLASS[variant]}
      >
        <PenLine aria-hidden="true" className="h-4 w-4" />
        投稿する
      </button>

      <Modal open={isOpen} onClose={() => setIsOpen(false)} title="カルチャーショックを投稿">
        {/* 閉じてもフォームは残すので、うっかり閉じても書きかけの内容は消えない */}
        <PostForm
          onSuccess={() => {
            setIsOpen(false);
            setToast("投稿しました");
          }}
        />
      </Modal>

      <Toast message={toast} onClose={closeToast} />
    </>
  );
}
