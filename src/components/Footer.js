import Post from "./Post";

export default function Footer({ posts }) {
  return (
    <div className="my-8">
      <h1 className="font-semibold text-lg sm:text-xl mt-16 mb-4">所有随想</h1>

      <Post posts={posts} />
    </div>
  );
}
