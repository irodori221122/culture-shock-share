import FormField, { inputClass } from "@/components/FormField";
import { COUNTRIES, STUDY_MONTHS_MAX, STUDY_MONTHS_MIN } from "@/lib/constants";

// 「留学先」と「留学期間（ヶ月）」の入力欄。新規登録とマイページの編集で共用する。
// onChange(name, value) で親のフォームに値を伝える。
export default function StudyFields({ idPrefix, studyCountry, studyMonths, errors, onChange }) {
  const countryId = `${idPrefix}-study-country`;
  const monthsId = `${idPrefix}-study-months`;

  return (
    <>
      <FormField label="留学先（国・地域）" htmlFor={countryId} error={errors.studyCountry}>
        <select
          id={countryId}
          value={studyCountry}
          onChange={(e) => onChange("studyCountry", e.target.value)}
          aria-invalid={Boolean(errors.studyCountry)}
          aria-describedby={errors.studyCountry ? `${countryId}-error` : undefined}
          className={inputClass(errors.studyCountry)}
        >
          <option value="">選択してください</option>
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
      </FormField>

      <FormField label="留学期間" htmlFor={monthsId} error={errors.studyMonths}>
        <div className="flex items-center gap-2">
          <input
            id={monthsId}
            type="number"
            inputMode="numeric"
            min={STUDY_MONTHS_MIN}
            max={STUDY_MONTHS_MAX}
            step={1}
            value={studyMonths}
            onChange={(e) => onChange("studyMonths", e.target.value)}
            aria-invalid={Boolean(errors.studyMonths)}
            aria-describedby={errors.studyMonths ? `${monthsId}-error` : undefined}
            className={`${inputClass(errors.studyMonths)} max-w-32`}
          />
          <span className="text-sm">ヶ月</span>
        </div>
      </FormField>
    </>
  );
}
