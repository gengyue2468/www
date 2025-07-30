import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
import { motion } from "motion/react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import axios from "axios";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { site } from "@/lib/site.config";

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
    <Layout title="他的脑洞">
      <div className="w-full">
        <h1 className="leading-relaxed text-balance text-3xl sm:text-6xl font-semibold">
          <span className="serif">他的脑洞非常大</span>
          <br />
          <span className="serif">他喜欢在这里倒垃圾</span>
          <br />
          <span className="serif">他更喜欢倒脏水在这里</span>
        </h1>

        <div className="flex flex-row space-x-4 justify-between items-center text-balance">
          <div className="w-2/3">
            <h2 className="text-lg sm:text-3xl mt-4 font-medium">
              Heeeeeee ~ （Peter Griffin 音）
            </h2>
          </div>
          <div className="w-1/3">
            <LazyLoadImage
              alt="Peter Griffin"
              effect="blur"
              src={`${site.cdn}/static/peter-griffin.webp`}
              className="rounded-full size-24 sm:size-54 object-cover object-center"
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
