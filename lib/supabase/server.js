import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// サーバー（Server Component / Server Action）で使う Supabase クライアント。
// リクエストごとに Cookie の中身が違う（＝ログインしている人が違う）ので、
// 使い回さず、使う関数の中で毎回作る。
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Server Component からは Cookie を書き込めないのでエラーになる。
            // ログイン情報の更新は proxy.js が毎リクエスト行うので、ここでは無視してよい。
          }
        },
      },
    },
  );
}
