"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import FormField, { inputClass } from "@/components/FormField";
import { signIn } from "@/lib/actions/auth";
import { validateLoginInput } from "@/lib/validation";

// ログインフォーム。next はログイン後に戻るページ（例: /me）
export default function LoginForm({ next }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    const { errors } = validateLoginInput(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    startTransition(async () => {
      let result;
      try {
        // 成功するとサーバー側でページを移動するので、戻り値が来るのは失敗したときだけ
        result = await signIn({ ...form, next });
      } catch {
        setFormError("通信に失敗しました。接続を確認して、もう一度お試しください。");
        return;
      }
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result?.error) setFormError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField label="メールアドレス" htmlFor="login-email" error={fieldErrors.email}>
        <input
          id="login-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "login-email-error" : undefined}
          className={inputClass(fieldErrors.email)}
        />
      </FormField>

      <FormField label="パスワード" htmlFor="login-password" error={fieldErrors.password}>
        <input
          id="login-password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "login-password-error" : undefined}
          className={inputClass(fieldErrors.password)}
        />
      </FormField>

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
        {isPending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  );
}
