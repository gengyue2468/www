import { useEffect, useState } from 'react';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { AlertCircleIcon } from "lucide-react"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { LazyLoadImage } from 'react-lazy-load-image-component';

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch('/api/notion');
        if (!res.ok) throw new Error('Failed to Fetch Posts, Please Check Your Internet Connection.');

        const data = await res.json();
        setPosts(data);
        console.log(data)
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout title="Home">
      <div className='mb-6 border-b border-b-neutral-300 dark:border-b-neutral-700 py-6'>
        <h1 className="text-4xl font-bold mb-8">家</h1>
        <p className='text-2xl opacity-75'>你好! 很好去见你这里在我的网络花园!</p>
      </div>

      {loading && (
        <div>loading...</div>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertCircleIcon />
          <AlertTitle className="font-bold">An Error Occurred.</AlertTitle>
          <AlertDescription>
            <p>{error}</p>
          </AlertDescription>
        </Alert>
      )}
      <div className='flex flex-col space-y-6'>
        {posts.map((post) => (
          <div key={post.id} className="border-b border-b-neutral-300 dark:border-b-neutral-700 py-6 w-full">
            <Link href={`/${post.id}`}>
              <div className='flex flex-row justify-between items-center space-x-8'>
                <div className='w-1/3'>
                  <LazyLoadImage
                    src={post.properties.Image.files[0].file.url} alt={post.properties.Title.title[0]?.plain_text || 'Untitled'} className='w-full rounded-lg' />
                </div>
                <div className='w-2/3'>
                  <h2 className="text-2xl font-bold mb-2">
                    {post.properties.Title.title[0]?.plain_text || 'Untitled'}
                  </h2>
                  <p className="opacity-75 font-medium">
                    {post.properties.Description?.rich_text[0]?.plain_text || 'No description'}
                  </p>
                </div>
              </div>

            </Link>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Home;
