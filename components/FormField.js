// フォームの共通部品: ラベル（上）・入力欄・エラー文（下）のセット。
// エラー文の id は「入力欄の id + -error」。入力欄の aria-describedby から指すと、
// スクリーンリーダーがエラー文も読み上げてくれる。
export default function FormField({ label, htmlFor, error, hint, children }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

// 入力欄の見た目（エラーがあれば枠をエラー色にする）
export function inputClass(error) {
  return `w-full min-h-11 rounded-xl border bg-surface px-4 py-2.5 ${
    error ? "border-danger" : "border-border"
  }`;
}
