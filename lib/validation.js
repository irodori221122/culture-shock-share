import {
  CONTENT_MAX_LENGTH,
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
