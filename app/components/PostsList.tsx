import { Link } from "react-router";

export default function PostsList({ posts }: { posts: any[] }) {
  if (!posts || posts.length === 0) {
    return <p className="px-4 py-8">还没有文章。</p>;
  }

  const groupedPosts = posts.reduce<Record<string, any[]>>((acc, post) => {
    if (!post.date) return acc;
    const dateObj = new Date(post.date);
    const yearMonth = `${dateObj.getFullYear()} 年 ${dateObj.getMonth() + 1} 月`;
    if (!acc[yearMonth]) acc[yearMonth] = [];
    acc[yearMonth].push(post);
    return acc;
  }, {});

  const months = Object.keys(groupedPosts).sort((a, b) => {
    const [ay, am] = a.match(/\d+/g)!.map(Number);
    const [by, bm] = b.match(/\d+/g)!.map(Number);
    return by !== ay ? by - ay : bm - am;
  });

  return (
    <div className="space-y-8 px-0">
      {months.map((month) => (
        <div key={month}>
          <h2 className="text-xl font-semibold mb-2">{month}</h2>
          <ul className="space-y-2">
            {groupedPosts[month].map((post) => {
              const day = new Date(post.date).getDate();
              return (
                <li key={post.slug} className="flex justify-between items-center text-lg gap-4">
                  <Link to={`/blog/${post.slug}`} className="font-semibold no-underline!">
                    {post.title}
                  </Link>
                  <span className="min-w-24 text-right font-medium">{day} 日</span>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
