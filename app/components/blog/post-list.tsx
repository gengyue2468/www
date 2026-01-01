import { Link } from "react-router";

export default function PostsList({ posts }: { posts: any[] }) {
  const filteredPosts = (posts || []).filter((p) => p.slug !== "about");
  if (!filteredPosts || filteredPosts.length === 0) {
    return <p className="px-4 py-8">还没有文章。</p>;
  }

  const groupedByYear = filteredPosts.reduce<Record<number, Record<number, any[]>>>((acc, post) => {
    if (!post.date) return acc;
    const dateObj = new Date(post.date);
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;
    
    if (!acc[year]) acc[year] = {};
    if (!acc[year][month]) acc[year][month] = [];
    acc[year][month].push(post);
    return acc;
  }, {});

  const years = Object.keys(groupedByYear)
    .map(Number)
    .sort((a, b) => b - a);

  return (
    <div className="space-y-16 px-0">
      {years.map((year) => {
        const months = Object.keys(groupedByYear[year])
          .map(Number)
          .sort((a, b) => b - a);

        return (
          <div key={year} className="space-y-8">
            {months.map((month, monthIndex) => (
              <div key={`${year}-${month}`}>
                {monthIndex === 0 ? (
                  <div className="flex justify-between items-baseline mb-4">
                    <h2 className="text-xl font-bold text-stone-800 tracking-tight">
                      {year} 年
                    </h2>
                    <span className="text-lg font-semibold text-stone-700">
                      {month} 月
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-end mb-4">
                    <span className="text-lg font-semibold text-stone-700">
                      {month} 月
                    </span>
                  </div>
                )}

                <ul className="space-y-3">
                  {groupedByYear[year][month].map((post) => {
                    const day = new Date(post.date).getDate();
                    return (
                      <li key={post.slug} className="flex justify-between items-baseline text-lg gap-6 group">
                        <Link to={`/blog/${post.slug}`} className="font-medium no-underline! group-hover:text-stone-600 transition-colors">
                          {post.title}
                        </Link>
                        <span className="min-w-20 text-right text-stone-500 text-base font-normal">
                          {day} 日
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
