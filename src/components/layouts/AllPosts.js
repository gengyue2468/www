import Post from "./Post";

export default function AllPosts({ posts, filterBy, searchValue, type }) {
  return (
    <div className="my-8">
      <h1 className="mb-4">
        {searchValue ? `按${filterBy}筛选出的随想` : "所有随想"}
      </h1>
      <Post
        posts={posts}
        filterBy={filterBy}
        searchValue={searchValue}
        type={type}
      />
    </div>
  );
}
