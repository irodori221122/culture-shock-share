import { redirect } from "next/navigation";
import FeedError from "@/components/FeedError";
import MyPostList from "@/components/MyPostList";
import ProfileForm from "@/components/ProfileForm";
import { getCurrentUser, getMyProfile } from "@/lib/auth";
import { fetchMyPosts } from "@/lib/posts";

export const metadata = {
  title: "マイページ",
  description: "プロフィールと自分の投稿の管理。",
};

// マイページ（ログイン必須）: プロフィールの表示・編集と、自分の投稿一覧
export default async function MyPage() {
  // ログインしていなければログインページへ（ログイン後はここに戻ってくる）
  if (!(await getCurrentUser())) redirect("/login?next=/me");

  const profile = await getMyProfile();
  let posts = null;
  try {
    posts = await fetchMyPosts();
  } catch (error) {
    console.error(error);
  }

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
      <h1 className="font-display text-2xl font-bold">マイページ</h1>

      <section aria-labelledby="profile-heading" className="mt-6 rounded-card border border-border bg-surface p-6">
        <h2 id="profile-heading" className="font-display text-lg font-bold">
          プロフィール
        </h2>
        {profile ? (
          <ProfileForm profile={profile} />
        ) : (
          <p className="mt-3 text-sm text-muted">プロフィールを読み込めませんでした。</p>
        )}
      </section>

      <section aria-labelledby="my-posts-heading" className="mt-10">
        <h2 id="my-posts-heading" className="font-display text-lg font-bold">
          自分の投稿
        </h2>
        <p className="mt-1 text-sm text-muted">
          ログインして投稿したものだけが表示されます。ここからも削除できます。
        </p>
        <div className="mt-4">
          {posts ? <MyPostList initialPosts={posts} profile={profile} /> : <FeedError />}
        </div>
      </section>
    </main>
  );
}
