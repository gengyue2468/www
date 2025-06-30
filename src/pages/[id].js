import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/notion/${id}`);
        if (!res.ok) throw new Error('Failed to fetch post');
        
        const data = await res.json();
        setPost(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">
        {post.page.properties.Title.title[0]?.plain_text || 'Untitled'}
      </h1>
      <div className="prose prose-lg">
        {/* 渲染文章内容块 */}
        {renderBlocks(post.blocks.results)}
      </div>
    </div>
  );
};

// 辅助函数：渲染 Notion 块
const renderBlocks = (blocks) => {
  return blocks.map((block) => {
    const { id, type } = block;
    
    // 根据不同类型的块渲染不同内容
    switch (type) {
      case 'paragraph':
        return (
          <p key={id} className="mb-4">
            {block.paragraph.text.map((text) => text.plain_text).join('')}
          </p>
        );
      case 'heading_1':
        return (
          <h1 key={id} className="text-2xl font-bold mb-4">
            {block.heading_1.text.map((text) => text.plain_text).join('')}
          </h1>
        );
      case 'heading_2':
        return (
          <h2 key={id} className="text-xl font-bold mb-3">
            {block.heading_2.text.map((text) => text.plain_text).join('')}
          </h2>
        );
      case 'image':
        const imageUrl = block.image.external 
          ? block.image.external.url 
          : block.image.file.url;
        return (
          <div key={id} className="my-6">
            <img src={imageUrl} alt="Notion Image" className="w-full h-auto rounded-lg shadow-md" />
          </div>
        );
      default:
        return null;
    }
  });
};

export default PostPage;