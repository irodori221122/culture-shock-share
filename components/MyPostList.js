"use client";

import { useCallback, useState } from "react";
import EmptyState from "@/components/EmptyState";
import PostCard from "@/components/PostCard";
import Toast from "@/components/Toast";

// マイページの「自分の投稿」一覧。ここからも削除できる。
export default function MyPostList({ initialPosts, profile }) {
  const [posts, setPosts] = useState(initialPosts);
  const [toast, setToast] = useState("");
  const closeToast = useCallback(() => setToast(""), []);

  // サーバーから新しい一覧が届いたら（削除後の再取得など）、それに置き換える
  const [prevInitialPosts, setPrevInitialPosts] = useState(initialPosts);
  if (initialPosts !== prevInitialPosts) {
    setPrevInitialPosts(initialPosts);
    setPosts(initialPosts);
  }

  function handleRemoved(postId, message) {
    setPosts((current) => current.filter((post) => post.id !== postId));
    setToast(message);
  }

  return (
    <>
      {posts.length === 0 ? (
        <EmptyState profile={profile} />
      ) : (
        <ul className="flex flex-col gap-4">
          {posts.map((post) => (
            <li key={post.id}>
              <PostCard
                post={post}
                isLoggedIn
                onRemoved={(message) => handleRemoved(post.id, message)}
              />
            </li>
          ))}
        </ul>
      )}
      <Toast message={toast} onClose={closeToast} />
    </>
  );
}
