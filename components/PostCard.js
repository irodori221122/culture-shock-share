import { CloudRain, GraduationCap, Lightbulb, Sun, HandHeart } from "lucide-react";
import CountryFlag from "@/components/CountryFlag";
import RelativeTime from "@/components/RelativeTime";
import { getCountryLabel, getGenreLabel, getTagLabel } from "@/lib/constants";

// 投稿 1 件分のカード。
// 上段: 国・ジャンル・タグ / 本文 / 下段: 日時・留学バッジ・リアクション
export default function PostCard({ post }) {
  const isPositive = post.tag === "positive";
  const TagIcon = isPositive ? Sun : CloudRain;

  return (
    <article className="animate-fade-in rounded-card border border-border bg-surface p-5 sm:p-6">
      {/* 上段 */}
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="mr-1 inline-flex items-center gap-1.5 font-medium">
          <CountryFlag code={post.country} />
          {getCountryLabel(post.country)}
        </span>
        <span className="rounded-full border border-border bg-background px-2.5 py-0.5 text-xs text-muted">
          {getGenreLabel(post.genre)}
        </span>
        {/* 色だけでなく、アイコンと文字でもポジ・ネガが分かるようにする */}
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
            isPositive
              ? "bg-mint-soft text-mint-ink"
              : "bg-accent-soft text-accent-ink"
          }`}
        >
          <TagIcon aria-hidden="true" className="h-3.5 w-3.5" />
          {getTagLabel(post.tag)}
        </span>
      </div>

      {/* 本文: 改行をそのまま表示する。文字列は React が自動でエスケープするので安全 */}
      <p className="mt-4 whitespace-pre-wrap break-words leading-relaxed">
        {post.content}
      </p>

      {/* 下段 */}
      <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted">
        <RelativeTime dateTime={post.created_at} />
        {post.author_study_country && post.author_study_months && (
          <span className="inline-flex items-center gap-1 rounded-full bg-background px-2 py-0.5">
            <GraduationCap aria-hidden="true" className="h-3.5 w-3.5" />
            {getCountryLabel(post.author_study_country)}留学
            {post.author_study_months}ヶ月
          </span>
        )}

        {/* リアクション件数（押せるボタンは Phase 5 で作る） */}
        <div className="ml-auto flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-1 text-mint-ink">
            <HandHeart aria-hidden="true" className="h-3.5 w-3.5" />
            それわかる！
            <span className="tabular-nums">{post.empathy_count}</span>
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-sun-soft px-2.5 py-1 text-sun-ink">
            <Lightbulb aria-hidden="true" className="h-3.5 w-3.5" />
            そんなのあるんだ！
            <span className="tabular-nums">{post.discovery_count}</span>
          </span>
        </div>
      </div>
    </article>
  );
}
