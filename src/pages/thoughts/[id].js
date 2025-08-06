import Layout from "@/components/Layout";
import { useEffect, useState } from "react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import { serialize } from "next-mdx-remote/serialize";
import { MDXRemote } from "next-mdx-remote";
import Footer from "@/components/Footer";
import axios from "axios";
import Header from "@/components/Header";
import { useRouter } from "next/router";
import Wrapper from "@/components/Wrapper";
import Image from "@/components/Image";
import { calculateReadingTime } from "@/components/CalculateReadingTime";

const components = {
  img: Image,
};

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [posts, setPosts] = useState(null);
  const [post, setPost] = useState(null);
  const [mdxSource, setMdxSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [readingTime, setReadingTime] = useState(0);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        if (!id) return;

        setPost(null);
        setMdxSource(null);
        setLoading(true);

        const resAll = await axios.get(`../api/notion`);
        const res = await axios.get(`../api/notion/${id}`);
        console.log("res:", res);

        if (resAll.status < 200 || resAll.status >= 300) {
          throw new Error(`拉取文章失败: ${resAll.statusText}`);
        }

        setPost(res.data);
        setPosts(resAll.data);

        const mdxContent =
          res.data.content;

        setReadingTime(calculateReadingTime(mdxContent));

        const serialized = await serialize(mdxContent);
        setMdxSource(serialized);
      } catch (error) {
        if (error.response) {
          setError(`请求失败: ${error.response.data.message || error.message}`);
        } else if (error.request) {
          setError("网络错误，无法连接到服务器");
        } else {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return (
    <Layout title={post?.properties.Title.title[0]?.plain_text || "载入中..."}>
      {loading && !error && <Loader />}
      {error && !mdxSource && <Error error={error} />}
      {!loading && mdxSource && (
        <div className="mt-0">
          <Header
            title={post.properties.Title.title[0]?.plain_text}
            date={post.properties.Date?.date?.start}
            desc={post.properties.Desc?.rich_text[0]?.plain_text}
            readingTime={readingTime}
          />

          <Wrapper>
            <MDXRemote {...mdxSource} components={components} />
          </Wrapper>

        <Footer posts={posts} />
        </div>
      )}
    </Layout>
  );
};

export default PostPage;
