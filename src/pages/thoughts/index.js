import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
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
      <div className="w-full">
        <h1 className="font-semibold mb-6">Thoughts</h1>

        <p className="mb-4">
          <span className="serif italic mr-1.5">Ridiculous Thoughts.</span>
          <span>
            Just random thoughts that reveals my perspectives. They are not so
            long, and contains little content. They are not so meaningful, and
            just stupid, sometimes are just completely wrong.
          </span>
        </p>

        <p className="mb-4">
          But I do grow through{" "}
          <span className="serif italic mr-1.5">Infinite Errors.</span>
        </p>

        {error && <Error error={error} />}
        {loading && <Loader />}
        {!loading && (
          <motion.div
            initial={{ opacity: 0, filter: "blur(5px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.25 }}
          >
            <div className="flex flex-col space-y-2 w-full">
              <Post posts={posts} />
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default Home;
