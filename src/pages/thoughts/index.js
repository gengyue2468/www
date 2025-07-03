import { useEffect, useState } from "react";
import Link from "next/link";
import Layout from "@/components/Layout";
import moment from "moment";
import { motion } from "motion/react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";

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
    <Layout title="Thoughts">
      <div className="w-screen sm:w-full">
        {error && <Error error={error} />}
        {loading && <Loader />}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-row justify-between items-center mb-2 opacity-50">
              <small>Name</small>
              <small>Date</small>
            </div>
            <div className="flex flex-col space-y-2">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="w-full mb-2 transition-all duration-500 opacity-100 hover:opacity-75 cursor-pointer"
                >
                  <Link href={`/thoughts/${post.id}`}>
                    <div className="flex flex-row justify-between items-center space-x-8">
                      <h1 className="font-medium">
                        {post.properties.Title.title[0]?.plain_text ||
                          "Untitled"}
                      </h1>
                      <h2 className="opacity-75 ">
                        {moment(post.properties.Date?.date?.start).format(
                          "MMM DD, YYYY"
                        )}
                      </h2>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
