"use client";

import { useId, useState, useTransition } from "react";
import { CloudRain, GraduationCap, LoaderCircle, Sun } from "lucide-react";
import FormField, { inputClass } from "@/components/FormField";
import { createPost } from "@/lib/actions/posts";
import { COUNTRIES, CONTENT_MAX_LENGTH, GENRES, getCountryLabel } from "@/lib/constants";
import { countChars, validatePostInput } from "@/lib/validation";

const EMPTY_FORM = { country: "", genre: "", tag: "", content: "" };

// 投稿フォーム（モーダルの中身）。
// 入力内容は state で持つので、送信に失敗しても消えない。
// profile: ログイン中なら自分の留学先・期間、未ログインなら null
export default function PostForm({ profile, onSuccess }) {
  const isLoggedIn = Boolean(profile);
  const [form, setForm] = useState(EMPTY_FORM);
  // 留学バッジを付けるか（ログイン時のみ表示。最初はオン）
  const [withBadge, setWithBadge] = useState(true);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  // 「投稿する」ボタンはヘッダーとスマホ用の 2 か所にあり、フォームも 2 つ存在する。
  // label と入力欄を結ぶ id が重ならないよう、フォームごとに一意な接頭辞を使う。
  const idPrefix = useId();
  const ids = {
    country: `${idPrefix}-country`,
    genre: `${idPrefix}-genre`,
    content: `${idPrefix}-content`,
    count: `${idPrefix}-content-count`,
    badge: `${idPrefix}-badge`,
  };

  const length = countChars(form.content.trim());
  const isOverLimit = length > CONTENT_MAX_LENGTH;

  // 1 項目だけ書き換える（その項目のエラーは消す）
  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault(); // ブラウザ標準の送信（ページ遷移）を止める
    setFormError("");

    // まずブラウザ側でチェックして、すぐにエラーを見せる
    const { errors } = validatePostInput(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    startTransition(async () => {
      let result;
      try {
        result = await createPost({ ...form, withBadge });
      } catch {
        // 通信が切れたときなど。入力内容はそのまま残る
        setFormError("通信に失敗しました。接続を確認して、もう一度お試しください。");
        return;
      }
      if (result.fieldErrors) {
        setFieldErrors(result.fieldErrors);
      } else if (result.error) {
        setFormError(result.error);
      } else {
        setForm(EMPTY_FORM);
        onSuccess();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      {/* 国・地域 */}
      <FormField label="国・地域" htmlFor={ids.country} error={fieldErrors.country}>
        <select
          id={ids.country}
          data-autofocus
          value={form.country}
          onChange={(e) => update("country", e.target.value)}
          aria-invalid={Boolean(fieldErrors.country)}
          aria-describedby={fieldErrors.country ? `${ids.country}-error` : undefined}
          className={inputClass(fieldErrors.country)}
        >
          <option value="">選択してください</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </FormField>

      {/* ジャンル */}
      <FormField label="ジャンル" htmlFor={ids.genre} error={fieldErrors.genre}>
        <select
          id={ids.genre}
          value={form.genre}
          onChange={(e) => update("genre", e.target.value)}
          aria-invalid={Boolean(fieldErrors.genre)}
          aria-describedby={fieldErrors.genre ? `${ids.genre}-error` : undefined}
          className={inputClass(fieldErrors.genre)}
        >
          <option value="">選択してください</option>
          {GENRES.map((g) => (
            <option key={g.code} value={g.code}>
              {g.label}
            </option>
          ))}
        </select>
      </FormField>

      {/* 内容 */}
      <FormField label="内容" htmlFor={ids.content} error={fieldErrors.content}>
        <textarea
          id={ids.content}
          rows={6}
          value={form.content}
          onChange={(e) => update("content", e.target.value)}
          placeholder="留学先で驚いたこと、戸惑ったことを書いてみましょう"
          aria-invalid={Boolean(fieldErrors.content)}
          aria-describedby={`${ids.count}${fieldErrors.content ? ` ${ids.content}-error` : ""}`}
          className={`${inputClass(fieldErrors.content)} resize-y leading-relaxed`}
        />
        <p
          id={ids.count}
          className={`mt-1 text-right text-xs tabular-nums ${isOverLimit ? "font-medium text-danger" : "text-muted"}`}
        >
          {length} / {CONTENT_MAX_LENGTH}
        </p>
      </FormField>

      {/* タグ（ラジオボタン 2 択） */}
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">タグ</legend>
        <div className="flex gap-2">
          <TagOption
            name={`${idPrefix}-tag`}
            value="positive"
            label="ポジティブ"
            Icon={Sun}
            checked={form.tag === "positive"}
            onChange={() => update("tag", "positive")}
            activeClass="border-mint-ink bg-mint-soft text-mint-ink"
          />
          <TagOption
            name={`${idPrefix}-tag`}
            value="negative"
            label="ネガティブ"
            Icon={CloudRain}
            checked={form.tag === "negative"}
            onChange={() => update("tag", "negative")}
            activeClass="border-accent-ink bg-accent-soft text-accent-ink"
          />
        </div>
        {fieldErrors.tag && (
          <p className="mt-1.5 text-sm text-danger">{fieldErrors.tag}</p>
        )}
      </fieldset>

      {/* 留学バッジ（ログイン時だけ） */}
      {isLoggedIn && (
        <label
          htmlFor={ids.badge}
          className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-2.5 text-sm"
        >
          <input
            id={ids.badge}
            type="checkbox"
            checked={withBadge}
            onChange={(e) => setWithBadge(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          <span>
            留学バッジを付ける
            <span className="ml-1 inline-flex items-center gap-1 text-xs text-muted">
              <GraduationCap aria-hidden="true" className="h-3.5 w-3.5" />
              {getCountryLabel(profile.study_country)}留学{profile.study_months}ヶ月
            </span>
          </span>
        </label>
      )}

      <p className="rounded-xl bg-background px-4 py-3 text-xs leading-relaxed text-muted">
        {isLoggedIn
          ? "名前は表示されません。自分の投稿は、あとから削除できます。"
          : "名前は表示されません。ログインせずに投稿した場合、あとから削除することはできません。"}
      </p>

      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-ink transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {isPending && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
        {isPending ? "送信中…" : "投稿する"}
      </button>
    </form>
  );
}

// タグの選択肢 1 つ分。本物のラジオボタンは見えなくして、外側のラベルをボタン風に見せる
function TagOption({ name, value, label, Icon, checked, onChange, activeClass }) {
  return (
    <label
      className={`inline-flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-4 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-accent ${
        checked ? `${activeClass} font-medium` : "border-border bg-surface text-muted hover:text-ink"
      }`}
    >
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <Icon aria-hidden="true" className="h-4 w-4" />
      {label}
    </label>
  );
}
