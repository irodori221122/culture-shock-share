import { MessageCircleHeart } from "lucide-react";
import NewPostButton from "@/components/NewPostButton";

// 投稿が 0 件のときの表示
export default function EmptyState() {
  return (
    <div className="rounded-card border border-dashed border-border bg-surface px-6 py-14 text-center">
      <MessageCircleHeart aria-hidden="true" className="mx-auto h-8 w-8 text-accent" />
      <p className="mt-4 font-display font-bold">まだ投稿がありません。</p>
      <p className="mt-1 text-sm text-muted">最初の1件を書いてみませんか？</p>
      <div className="mt-6">
        <NewPostButton variant="inline" />
      </div>
    </div>
  );
}
