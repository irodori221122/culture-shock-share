import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// ページが表示される前に毎回呼ばれ、ログイン情報（Cookie）の期限が切れていれば更新する。
// これがないと、しばらく経つと勝手にログアウトされたような状態になる。
export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  // 環境変数がまだ設定されていない間（Supabase 準備前）は何もしない
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  ) {
    return supabaseResponse;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 更新された Cookie を「このリクエスト」と「ブラウザへ返すレスポンス」の両方に反映する
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
          // ログイン情報入りのページがキャッシュされないようにするヘッダー
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value),
          );
        },
      },
    },
  );

  // 公式ガイドの注意: createServerClient と getClaims の間に別の処理を挟まないこと。
  // getClaims を呼ぶことで、必要ならここでトークンが更新される。
  await supabase.auth.getClaims();

  // 必ずこの supabaseResponse を返す（Cookie の更新が載っているため）
  return supabaseResponse;
}
