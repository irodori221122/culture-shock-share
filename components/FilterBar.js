"use client";

import { useOptimistic, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { COUNTRIES, DEFAULT_SORT, SORT_OPTIONS } from "@/lib/constants";

// 国の絞り込みと並び替え。
// 選んだ値は URL（例: /?country=US&sort=empathy）に入れる。
// こうすると、リロード・共有・戻る操作でも同じ状態で開ける。
export default function FilterBar({ country, sort }) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  // 画面の切り替えが終わるまでの間も、押した選択肢をすぐ選択状態に見せる
  const [optimistic, setOptimistic] = useOptimistic({ country, sort });

  function navigate(next) {
    const params = new URLSearchParams();
    if (next.country) params.set("country", next.country);
    if (next.sort !== DEFAULT_SORT) params.set("sort", next.sort);
    const query = params.toString();

    startTransition(() => {
      setOptimistic(next);
      router.push(query ? `/?${query}` : "/", { scroll: false });
    });
  }

  return (
    <div className="sticky top-14 z-10 -mx-4 bg-background/90 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center gap-2">
        {/* 国・地域セレクト */}
        <div className="relative min-w-0 flex-1 sm:flex-none">
          <label htmlFor="country-filter" className="sr-only">
            国・地域で絞り込む
          </label>
          <select
            id="country-filter"
            value={optimistic.country ?? ""}
            onChange={(e) =>
              navigate({ ...optimistic, country: e.target.value || null })
            }
            className="min-h-11 w-full appearance-none rounded-full border border-border bg-surface py-2 pl-4 pr-10 text-sm sm:w-56"
          >
            <option value="">すべての国・地域</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDown
            aria-hidden="true"
            className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
          />
        </div>

        {/* 並び替え（セグメントコントロール） */}
        <div
          role="group"
          aria-label="並び替え"
          className="flex rounded-full border border-border bg-surface p-1"
        >
          {SORT_OPTIONS.map((option) => {
            const isActive = optimistic.sort === option.code;
            return (
              <button
                key={option.code}
                type="button"
                aria-pressed={isActive}
                onClick={() => navigate({ ...optimistic, sort: option.code })}
                className={`min-h-9 rounded-full px-4 text-sm transition-colors ${
                  isActive
                    ? "bg-ink font-medium text-surface"
                    : "text-muted hover:text-ink"
                }`}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
