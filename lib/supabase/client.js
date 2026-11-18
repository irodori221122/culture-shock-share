import { createBrowserClient } from "@supabase/ssr";

// ブラウザ（Client Component）で使う Supabase クライアント。
// ログイン状態は Cookie に保存されるので、サーバー側からも同じログイン状態を読める。
// createBrowserClient は内部で 1 つのインスタンスを使い回すため、何度呼んでもよい。
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}
