import { updateSession } from "@/lib/supabase/proxy";

// Next.js 16 の「proxy」（旧 middleware）。ページの処理より先に毎回動く。
// ここではログイン情報の更新だけを行う（ページごとのアクセス制御は各ページで行う）。
export async function proxy(request) {
  return await updateSession(request);
}

export const config = {
  // 画像や Next.js の内部ファイルには不要なので、それ以外のパスでだけ動かす
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
