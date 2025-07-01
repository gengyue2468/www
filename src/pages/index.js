import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import moment from "moment";
import HomeSkeleton from "@/components/Home-skeleton";
import { TextScramble } from "@/components/ui/text-scramble";
import { TextEffect } from "@/components/ui/text-effect";
import Error from "@/components/Error";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/notion");
        if (!res.ok)
          throw new Error(
            "Failed to Fetch Posts, Please Check Your Internet Connection."
          );

        const data = await res.json();
        setPosts(data);
        console.log(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout title="Geng Yue">
      <div className="mb-8">
        <TextScramble as="h1" className="font-bold mb-2.5">
          Geng Yue
        </TextScramble>
        <TextScramble as="p" className="opacity-75">
          Hey👋! I&apos;m a senior school graduate who is about to go to university.
          Here is my online garden and laboratory.
        </TextScramble>
      </div>

      <div className="">
        <TextScramble as="h1" className="font-bold mb-2.5">
          Recent Published
        </TextScramble>

        {error && <Error error={error} />}
        {loading &&
          Array.from({ length: 6 }).map((_, index) => (
            <HomeSkeleton key={index} />
          ))}

        <div className="flex flex-col space-y-2">
          {posts.map((post) => (
            <div
              key={post.id}
              className="w-full mb-2 transition-all duration-500 opacity-75 hover:opacity-100"
            >
              <Link href={`/${post.id}`}>
                <div className="flex flex-row justify-between items-center space-x-8">
                  <TextScramble as="h1" className="font-semibold">
                    {post.properties.Title.title[0]?.plain_text || "Untitled"}
                  </TextScramble>
                  <TextScramble as="h2" className="font-medium opacity-75 ">
                    {moment(post.properties.Date?.date?.start).format(
                      "MMM DD, YYYY"
                    )}
                  </TextScramble>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Home;
