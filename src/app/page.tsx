"use client";
import type { Post } from "@/types/post_client";
import { useState, useEffect } from "react";
import { getTopLevelPosts } from "@/lib/actions.post";
import { useRouter } from "next/navigation";
import sortOnTimestamp from "@/util/sort-on-timestamp";
import ComponentPost from "@/components/post/post";
import ComponentPostCreate from "@/components/post/create";

export default function Home() {
  const [posts, setPosts] = useState<any[]>([]);
  const router = useRouter();
  const newPostCreated = async (post) => {
    router.push(`post/${post.id}`);
  };
  useEffect(() => {
    const getPosts = async () => {
      const posts: any[] = await getTopLevelPosts();
      // sort by timestamp
      setPosts(sortOnTimestamp(posts));
    };
    getPosts();
    return () => {
      // cleanup
    };
  }, []);
  return (
    <section>
      <ComponentPostCreate newPostCreated={newPostCreated} />
      <div className="posts">
        {posts.map((post: Post) => (
          <a
            className="post"
            href={`/post/${post.id}`}
            key={post.id}
            title={post.timestamp}
          >
            <ComponentPost post={post}></ComponentPost>
          </a>
        ))}
      </div>
    </section>
  );
}
