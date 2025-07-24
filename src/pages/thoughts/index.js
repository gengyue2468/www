import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
import { motion } from "motion/react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await axios.get("/api/notion");
        setPosts(res.data);
      } catch (error) {
        if (error.response) {
          setError(`无法拉取文章: ${error.response.statusText}`);
        } else if (error.request) {
          setError("无法拉取文章.");
        } else {
          setError(`错误: ${error.message}`);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <Layout title="随想">
      <div className="w-full">
        <h1 className="font-extrabold text-3xl mb-2">随想</h1>

        <div className="flex flex-row space-x-4 items-center text-balance">
          <div className="w-2/3">
            <p className="font-medium text-lg sm:text-xl">
              Hey, Lois. Did you see Stewie? Heeeeeeeeee~
            </p>
          </div>
          <div className="w-1/3">
            <LazyLoadImage
              effect="blur"
              src="/static/petter-griffin.webp"
              className="rounded-full size-24 sm:size-36"
            />
          </div>
        </div>

        {error && !posts && <Error error={error} />}
        {loading && !error && <Loader />}
        <motion.div
          initial={{ opacity: 0, filter: "blur(5px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          transition={{ duration: 0.25 }}
        >
          {!loading && <Post posts={posts} />}{" "}
        </motion.div>
      </div>
    </Layout>
  );
};

export default Home;
