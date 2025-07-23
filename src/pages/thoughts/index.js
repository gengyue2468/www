import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Post from "@/components/Post";
import { motion } from "motion/react";
import Error from "@/components/Error";
import Loader from "@/components/Loader";
import axios from "axios";

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
        <h1 className="font-semibold mb-6">随想</h1>

        <p className="mb-4">恭喜你！旅行者，你成功来到了我的大脑的荒漠.</p>

        {error && <Error error={error} />}
        {loading && <Loader />}
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
