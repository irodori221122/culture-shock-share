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
    posts: await attachMyReactions(supabase, posts),
    hasMore: data.length > PAGE_SIZE,
  };
}

// ログイン中なら、各投稿に「自分が付けたリアクション」（my_reaction）を付け足す。
// 未ログインなら全部 null。reactions は RLS で自分の行しか読めない。
export async function attachMyReactions(supabase, posts) {
  const user = await getCurrentUser();
  if (!user || posts.length === 0) {
    return posts.map((post) => ({ ...post, my_reaction: null }));
  }

  const { data } = await supabase
    .from("reactions")
    .select("post_id, type")
    .eq("user_id", user.id)
    .in(
      "post_id",
      posts.map((post) => post.id),
    );

  const typeByPostId = new Map((data ?? []).map((r) => [r.post_id, r.type]));
  return posts.map((post) => ({
    ...post,
    my_reaction: typeByPostId.get(post.id) ?? null,
  }));
}
