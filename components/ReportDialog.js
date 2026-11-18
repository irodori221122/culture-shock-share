"use client";

import { useState, useTransition } from "react";
import { LoaderCircle } from "lucide-react";
import FormField, { inputClass } from "@/components/FormField";
import Modal from "@/components/Modal";
import { reportPost } from "@/lib/actions/reports";
import { REPORT_DETAIL_MAX_LENGTH, REPORT_REASONS } from "@/lib/constants";
import { countChars } from "@/lib/validation";

// 通報ダイアログ。理由を選び、「その他」のときだけ補足を書ける。
// onReported({ hidden }) … 通報が受け付けられたら呼ぶ（hidden = この通報で非表示になったか）
export default function ReportDialog({ postId, open, onClose, onReported }) {
  const [reason, setReason] = useState("");
  const [detail, setDetail] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();
  const reasonId = `report-reason-${postId}`;
  const detailId = `report-detail-${postId}`;

  function handleSubmit(event) {
    event.preventDefault();
    setFormError("");
    if (!reason) {
      setFieldErrors({ reason: "通報理由を選んでください" });
      return;
    }
    if (reason === "other" && countChars(detail.trim()) > REPORT_DETAIL_MAX_LENGTH) {
      setFieldErrors({ detail: `${REPORT_DETAIL_MAX_LENGTH}文字以内で入力してください` });
      return;
    }
    startTransition(async () => {
      let result;
      try {
        result = await reportPost({ postId, reason, detail });
      } catch {
        setFormError("通信に失敗しました。もう一度お試しください。");
        return;
      }
      if (result.fieldErrors) setFieldErrors(result.fieldErrors);
      else if (result.error) setFormError(result.error);
      else onReported({ hidden: result.hidden });
    });
  }

  return (
    <Modal open={open} onClose={onClose} title="この投稿を通報">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <FormField label="通報理由" htmlFor={reasonId} error={fieldErrors.reason}>
          <select
            id={reasonId}
            data-autofocus
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              setFieldErrors({});
            }}
            aria-invalid={Boolean(fieldErrors.reason)}
            aria-describedby={fieldErrors.reason ? `${reasonId}-error` : undefined}
            className={inputClass(fieldErrors.reason)}
          >
            <option value="">選択してください</option>
            {REPORT_REASONS.map((r) => (
              <option key={r.code} value={r.code}>
                {r.label}
              </option>
            ))}
          </select>
        </FormField>

        {reason === "other" && (
          <FormField label="補足（任意）" htmlFor={detailId} error={fieldErrors.detail}>
            <textarea
              id={detailId}
              rows={3}
              value={detail}
              onChange={(e) => setDetail(e.target.value)}
              aria-invalid={Boolean(fieldErrors.detail)}
              aria-describedby={`${detailId}-count${fieldErrors.detail ? ` ${detailId}-error` : ""}`}
              className={`${inputClass(fieldErrors.detail)} resize-y`}
            />
            <p
              id={`${detailId}-count`}
              className={`mt-1 text-right text-xs tabular-nums ${
                countChars(detail.trim()) > REPORT_DETAIL_MAX_LENGTH ? "font-medium text-danger" : "text-muted"
              }`}
            >
              {countChars(detail.trim())} / {REPORT_DETAIL_MAX_LENGTH}
            </p>
          </FormField>
        )}

        <p className="rounded-xl bg-background px-4 py-3 text-xs leading-relaxed text-muted">
          通報した内容は、投稿者を含め誰にも表示されません。通報が一定数集まった投稿は、自動的に非表示になります。
        </p>

        {formError && (
          <p role="alert" className="text-sm text-danger">
            {formError}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-ink px-6 font-medium text-surface hover:opacity-90 disabled:opacity-60"
        >
          {isPending && <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />}
          {isPending ? "送信中…" : "通報する"}
        </button>
      </form>
    </Modal>
  );
}
