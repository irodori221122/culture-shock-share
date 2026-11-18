"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateLoginInput, validateSignUpInput } from "@/lib/validation";

// ログイン・新規登録・ログアウトの Server Action。
// サーバーで実行するので、ログイン情報（Cookie）もサーバーが直接書き込める。

// Supabase のエラー（英語のコード）を日本語の案内文に変える
function toJapaneseMessage(error) {
  switch (error?.code) {
    case "invalid_credentials":
      return "メールアドレスまたはパスワードが正しくありません。";
    case "user_already_exists":
    case "email_exists":
      return "このメールアドレスはすでに登録されています。ログインしてください。";
    case "weak_password":
      return "パスワードが短すぎるか、推測されやすいものです。別のパスワードにしてください。";
    case "email_address_invalid":
      return "このメールアドレスは使えません。別のアドレスをお試しください。";
    case "email_not_confirmed":
      return "メールアドレスの確認が済んでいません。届いたメールのリンクを開いてください。";
    case "over_request_rate_limit":
    case "over_email_send_rate_limit":
      return "短時間に何度も試されたため、一時的に制限されています。しばらく待ってからお試しください。";
    case "signup_disabled":
    case "email_provider_disabled":
      return "現在、新規登録・ログインを受け付けていません。";
    default:
      return "うまくいきませんでした。時間をおいてもう一度お試しください。";
  }
}

// ログイン後に戻る先。外部サイトへ飛ばされないよう、このサイト内のパスだけを許す
// （"//example.com" や "/\example.com" はブラウザが外部サイトと解釈するので弾く）
function safeNextPath(next) {
  return typeof next === "string" && /^\/(?![/\\])/.test(next) ? next : "/";
}

export async function signUp(input) {
  const { errors, values } = validateSignUpInput(input ?? {});
  if (Object.keys(errors).length > 0) return { fieldErrors: errors };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: values.email,
    password: values.password,
    options: {
      // ここで渡した値を、DB のトリガー（handle_new_user）が profiles に保存する
      data: {
        study_country: values.studyCountry,
        study_months: values.studyMonths,
      },
    },
  });

  if (error) {
    console.error("signUp:", error.code, error.message);
    return { error: toJapaneseMessage(error) };
  }

  // 「Confirm email」がオンの設定だと、ここではまだログインされない
  if (!data.session) {
    return {
      notice: "確認メールを送りました。メール内のリンクを開いてから、ログインしてください。",
    };
  }

  revalidatePath("/", "layout"); // ヘッダーなど全ページの表示をログイン後の状態にする
  redirect("/");
}

export async function signIn(input) {
  const { errors, values } = validateLoginInput(input ?? {});
  if (Object.keys(errors).length > 0) return { fieldErrors: errors };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: values.email,
    password: values.password,
  });

  if (error) {
    console.error("signIn:", error.code, error.message);
    return { error: toJapaneseMessage(error) };
  }

  revalidatePath("/", "layout");
  redirect(safeNextPath(input?.next));
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
