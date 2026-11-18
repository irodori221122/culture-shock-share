import {
  CONTENT_MAX_LENGTH,
  STUDY_MONTHS_MAX,
  STUDY_MONTHS_MIN,
  isValidCountry,
  isValidGenre,
  isValidTag,
} from "@/lib/constants";

// 入力チェック。ブラウザ（すぐにエラーを出す用）とサーバー（本番の守り）の両方で同じ関数を使う。
// サーバー側でも必ずチェックするのは、ブラウザのチェックは改造すれば簡単にすり抜けられるため。

// 文字数を数える。絵文字なども 1 文字と数え、DB の char_length と同じ結果にする
// （JavaScript の .length は絵文字を 2 文字と数えてしまう）。
export function countChars(text) {
  return [...text].length;
}

// 投稿フォームのチェック。errors が空なら OK。
export function validatePostInput({ country, genre, tag, content }) {
  const errors = {};
  const trimmed = typeof content === "string" ? content.trim() : "";

  if (!isValidCountry(country)) errors.country = "国・地域を選んでください";
  if (!isValidGenre(genre)) errors.genre = "ジャンルを選んでください";
  if (!isValidTag(tag)) errors.tag = "ポジティブかネガティブかを選んでください";

  if (trimmed.length === 0) {
    errors.content = "内容を入力してください";
  } else if (countChars(trimmed) > CONTENT_MAX_LENGTH) {
    errors.content = `${CONTENT_MAX_LENGTH}文字以内で入力してください`;
  }

  return { errors, values: { country, genre, tag, content: trimmed } };
}

// パスワードの最低文字数
export const PASSWORD_MIN_LENGTH = 8;

// 留学先・期間のチェック（新規登録とプロフィール編集で共用）
export function validateProfileInput({ studyCountry, studyMonths }) {
  const errors = {};
  // フォームからは文字列で届くので数値に直す（"10" → 10）
  const months = Number(studyMonths);

  if (!isValidCountry(studyCountry)) {
    errors.studyCountry = "留学先を選んでください";
  }
  if (studyMonths === "" || studyMonths == null) {
    errors.studyMonths = "留学期間を入力してください";
  } else if (
    !Number.isInteger(months) ||
    months < STUDY_MONTHS_MIN ||
    months > STUDY_MONTHS_MAX
  ) {
    errors.studyMonths = `${STUDY_MONTHS_MIN}〜${STUDY_MONTHS_MAX}の整数で入力してください`;
  }

  return { errors, values: { studyCountry, studyMonths: months } };
}

// 新規登録フォームのチェック
export function validateSignUpInput({ email, password, studyCountry, studyMonths }) {
  const profile = validateProfileInput({ studyCountry, studyMonths });
  const errors = { ...profile.errors };
  const trimmedEmail = typeof email === "string" ? email.trim() : "";

  if (!trimmedEmail) {
    errors.email = "メールアドレスを入力してください";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    errors.email = "メールアドレスの形式が正しくありません";
  }
  if (typeof password !== "string" || password.length < PASSWORD_MIN_LENGTH) {
    errors.password = `パスワードは${PASSWORD_MIN_LENGTH}文字以上にしてください`;
  }

  return {
    errors,
    values: { email: trimmedEmail, password, ...profile.values },
  };
}

// ログインフォームのチェック（形式だけ。正しいかどうかは Supabase が判定する）
export function validateLoginInput({ email, password }) {
  const errors = {};
  const trimmedEmail = typeof email === "string" ? email.trim() : "";
  if (!trimmedEmail) errors.email = "メールアドレスを入力してください";
  if (typeof password !== "string" || password.length === 0) {
    errors.password = "パスワードを入力してください";
  }
  return { errors, values: { email: trimmedEmail, password } };
}
