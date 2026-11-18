"use client";

import { useCallback, useState, useTransition } from "react";
import { GraduationCap, LoaderCircle, Pencil } from "lucide-react";
import StudyFields from "@/components/StudyFields";
import Toast from "@/components/Toast";
import { updateProfile } from "@/lib/actions/profile";
import { getCountryLabel } from "@/lib/constants";
import { validateProfileInput } from "@/lib/validation";

// マイページのプロフィール（表示 ⇔ 編集の切り替え）
export default function ProfileForm({ profile }) {
  const [isEditing, setIsEditing] = useState(false);
  // 表示中のプロフィール。保存に成功したら、サーバーの再読み込みを待たずにすぐ書き換える
  const [current, setCurrent] = useState(profile);
  const [prevProfile, setPrevProfile] = useState(profile);
  if (profile !== prevProfile) {
    setPrevProfile(profile);
    setCurrent(profile);
  }
  const [form, setForm] = useState({
    studyCountry: profile.study_country,
    studyMonths: String(profile.study_months),
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState("");
  const closeToast = useCallback(() => setToast(""), []);
  const [isPending, startTransition] = useTransition();

  function update(name, value) {
    setForm((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    const { errors } = validateProfileInput(form);
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    startTransition(async () => {
      let result;
      try {
        result = await updateProfile(form);
      } catch {
        setFormError("通信に失敗しました。もう一度お試しください。");
        return;
      }
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      else if (result.error) setFormError(result.error);
      else {
        setCurrent({ study_country: form.studyCountry, study_months: Number(form.studyMonths) });
        setIsEditing(false);
        setToast("プロフィールを保存しました");
      }
    });
  }

  if (!isEditing) {
    return (
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="inline-flex items-center gap-1.5">
          <GraduationCap aria-hidden="true" className="h-4 w-4 text-muted" />
          {getCountryLabel(current.study_country)}留学{current.study_months}ヶ月
        </p>
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-4 text-sm font-medium hover:bg-background"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" />
          編集する
        </button>
        <Toast message={toast} onClose={closeToast} />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="mt-4 flex flex-col gap-5">
      <StudyFields
        idPrefix="profile"
        studyCountry={form.studyCountry}
        studyMonths={form.studyMonths}
        errors={fieldErrors}
        onChange={update}
      />
      <p className="text-xs text-muted">
        変更は、これから投稿するときの留学バッジに反映されます（過去の投稿のバッジは変わりません）。
      </p>
      {formError && (
        <p role="alert" className="text-sm text-danger">
          {formError}
        </p>
      )}
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => {
            setIsEditing(false);
            setFieldErrors({});
            setForm({ studyCountry: current.study_country, studyMonths: String(current.study_months) });
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border px-6 font-medium hover:bg-background"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-accent px-6 font-medium text-ink hover:bg-accent-hover disabled:opacity-60"
        >
          {isPending && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
          {isPending ? "保存中…" : "保存する"}
        </button>
      </div>
    </form>
  );
}
