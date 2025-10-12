import Post from "./Post";

export default function AllPosts({ posts }) {
  return (
    <div className="my-8">
      <Post posts={posts} />
    </div>
  );
}
