"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import FormField, { inputClass } from "@/components/FormField";
import StudyFields from "@/components/StudyFields";
import { signUp } from "@/lib/actions/auth";
import { PASSWORD_MIN_LENGTH, validateSignUpInput } from "@/lib/validation";

// 新規登録フォーム（メール・パスワード・留学先・留学期間）
export default function SignUpForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    studyCountry: "",
    studyMonths: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");
  const [isPending, startTransition] = useTransition();

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    const { errors } = validateSignUpInput(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    startTransition(async () => {
      let result;
      try {
        // 成功するとサーバー側でトップページへ移動する
        result = await signUp(form);
      } catch {
        setFormError("通信に失敗しました。接続を確認して、もう一度お試しください。");
        return;
      }
      if (result?.fieldErrors) setFieldErrors(result.fieldErrors);
      if (result?.error) setFormError(result.error);
      if (result?.notice) setNotice(result.notice);
    });
  }

  if (notice) {
    return (
      <p role="status" className="rounded-xl bg-mint-soft px-4 py-3 text-sm text-mint-ink">
        {notice}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <FormField label="メールアドレス" htmlFor="signup-email" error={fieldErrors.email}>
        <input
          id="signup-email"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          aria-invalid={Boolean(fieldErrors.email)}
          aria-describedby={fieldErrors.email ? "signup-email-error" : undefined}
          className={inputClass(fieldErrors.email)}
        />
      </FormField>

      <FormField
        label="パスワード"
        htmlFor="signup-password"
        error={fieldErrors.password}
        hint={`${PASSWORD_MIN_LENGTH}文字以上`}
      >
        <input
          id="signup-password"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => update("password", e.target.value)}
          aria-invalid={Boolean(fieldErrors.password)}
          aria-describedby={fieldErrors.password ? "signup-password-error" : undefined}
          className={inputClass(fieldErrors.password)}
        />
      </FormField>

      <StudyFields
        idPrefix="signup"
        studyCountry={form.studyCountry}
        studyMonths={form.studyMonths}
        errors={fieldErrors}
        onChange={update}
      />

      <p className="rounded-xl bg-background px-4 py-3 text-xs leading-relaxed text-muted">
        留学先と期間は、投稿に付ける「留学バッジ」（例: アメリカ留学10ヶ月）に使います。
        メールアドレスが他の人に表示されることはありません。
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
        {isPending ? "登録中…" : "登録する"}
      </button>
    </form>
  );
}
