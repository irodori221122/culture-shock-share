import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  DEFAULT_SORT,
  PAGE_SIZE,
  isValidCountry,
  isValidSort,
} from "@/lib/constants";

// 投稿一覧の取得まわり（サーバー専用）。
// Server Component（最初の 20 件）と Server Action（もっと見る）の両方から使う。

// 画面に必要な列だけを取る。user_id は DB の権限で読めないようにしてあり、ここにも書かない。
const POST_COLUMNS =
  "id, created_at, country, genre, tag, content, author_study_country, author_study_months, empathy_count, discovery_count";

// URL の ?country= / ?sort= は誰でも好きな値を入れられるので、
// 知らない値は「すべての国」「新着順」として扱う。
export function normalizeFeedParams({ country, sort } = {}) {
  return {
    country:
      typeof country === "string" && isValidCountry(country) ? country : null,
    sort: typeof sort === "string" && isValidSort(sort) ? sort : DEFAULT_SORT,
  };
}

// offset 件目から 20 件を取得する。hasMore は「まだ続きがあるか」。
export async function fetchPosts({ country, sort, offset = 0 }) {
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select(POST_COLUMNS)
    // 自分の投稿は非表示でも RLS 上は読めてしまうので、一覧では明示的に除く
    .eq("is_hidden", false);

  if (country) {
    query = query.eq("country", country);
  }

  if (sort === "empathy") {
    query = query.order("empathy_count", { ascending: false });
  } else if (sort === "discovery") {
    query = query.order("discovery_count", { ascending: false });
  }
  // 同じ件数どうしは新しい順。最後に id でも並べ、ページの境目で順番がぶれないようにする
  query = query
    .order("created_at", { ascending: false })
    .order("id", { ascending: false });

  // 21 件（1 件多め）取って、21 件目があれば「もっと見る」を出す
  const { data, error } = await query.range(offset, offset + PAGE_SIZE);

  if (error) {
    throw new Error(`投稿の取得に失敗しました: ${error.message}`);
  }

  const posts = data.slice(0, PAGE_SIZE);
  return {
    posts: await attachViewerInfo(supabase, posts),
    hasMore: data.length > PAGE_SIZE,
  };
}

// 見ている人に合わせた情報を各投稿に付け足す。
//   my_reaction: 自分が付けたリアクション（"empathy" / "discovery" / null）
//   is_mine:     自分の投稿か（削除メニューを出すかどうかに使う）
// 未ログインなら my_reaction は null、is_mine は false。
// user_id 列は読めないようにしてあるので、「自分の投稿か」は DB の関数 my_post_ids に聞く。
export async function attachViewerInfo(supabase, posts) {
  const user = await getCurrentUser();
  if (!user || posts.length === 0) {
    return posts.map((post) => ({ ...post, my_reaction: null, is_mine: false }));
  }

  const postIds = posts.map((post) => post.id);
  const [reactionsResult, mineResult] = await Promise.all([
    // reactions は RLS で自分の行しか読めない
    supabase
      .from("reactions")
      .select("post_id, type")
      .eq("user_id", user.id)
      .in("post_id", postIds),
    supabase.rpc("my_post_ids", { post_ids: postIds }),
  ]);

  const typeByPostId = new Map(
    (reactionsResult.data ?? []).map((r) => [r.post_id, r.type]),
  );
  // rpc は uuid の配列（["..."] の形）で返ってくる
  const myIds = new Set(mineResult.data ?? []);

  return posts.map((post) => ({
    ...post,
    my_reaction: typeByPostId.get(post.id) ?? null,
    is_mine: myIds.has(post.id),
  }));
}

// 自分の投稿を新しい順に取得する（マイページ用。通報で非表示になったものも含む）
export async function fetchMyPosts() {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_posts");
  if (error) {
    throw new Error(`自分の投稿の取得に失敗しました: ${error.message}`);
  }
  return attachViewerInfo(supabase, data);
}
