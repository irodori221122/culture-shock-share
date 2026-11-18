"use client";

import { useId, useState, useTransition } from "react";
import { CloudRain, LoaderCircle, Sun } from "lucide-react";
import { createPost } from "@/lib/actions/posts";
import { COUNTRIES, CONTENT_MAX_LENGTH, GENRES } from "@/lib/constants";
import { countChars, validatePostInput } from "@/lib/validation";

const EMPTY_FORM = { country: "", genre: "", tag: "", content: "" };

// 投稿フォーム（モーダルの中身）。
// 入力内容は state で持つので、送信に失敗しても消えない。
export default function PostForm({ onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
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
        result = await createPost(form);
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
      <Field label="国・地域" htmlFor={ids.country} error={fieldErrors.country}>
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
      </Field>

      {/* ジャンル */}
      <Field label="ジャンル" htmlFor={ids.genre} error={fieldErrors.genre}>
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
      </Field>

      {/* 内容 */}
      <Field label="内容" htmlFor={ids.content} error={fieldErrors.content}>
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
      </Field>

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

      <p className="rounded-xl bg-background px-4 py-3 text-xs leading-relaxed text-muted">
        名前は表示されません。ログインせずに投稿した場合、あとから削除することはできません。
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

// ラベル（上）・入力欄・エラー文（下）のセット
function Field({ label, htmlFor, error, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
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

function inputClass(error) {
  return `w-full rounded-xl border bg-surface px-4 py-2.5 min-h-11 ${
    error ? "border-danger" : "border-border"
  }`;
}
