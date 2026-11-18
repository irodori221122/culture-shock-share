// 読み込み中に出す、投稿カードの形をした仮の箱（3 つ）
export default function PostListSkeleton() {
  return (
    <div role="status" aria-label="読み込み中" className="flex flex-col gap-4">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="animate-pulse rounded-card border border-border bg-surface p-4 sm:p-6"
        >
          <div className="flex gap-2">
            <div className="h-5 w-24 rounded-full bg-border" />
            <div className="h-5 w-16 rounded-full bg-border" />
            <div className="h-5 w-20 rounded-full bg-border" />
          </div>
          <div className="mt-5 space-y-2">
            <div className="h-4 w-full rounded bg-border" />
            <div className="h-4 w-11/12 rounded bg-border" />
            <div className="h-4 w-2/3 rounded bg-border" />
          </div>
          <div className="mt-6 flex justify-between">
            <div className="h-4 w-16 rounded bg-border" />
            <div className="h-7 w-48 rounded-full bg-border" />
          </div>
        </div>
      ))}
    </div>
  );
}
