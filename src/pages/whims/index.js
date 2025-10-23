import Layout from "@/components/layouts/Layout";
import AllPosts from "@/components/layouts/AllPosts";
import { getAllPosts } from "@/lib/markdown/getPosts";
import { ListFilterIcon } from "lucide-react";

import { InView } from "react-intersection-observer";
import { motion } from "motion/react";
import FilterPost from "@/components/ui/FilterPost";
import Drawer from "@/components/ui/Drawer";
import Tooltip from "@/components/ui/Tooltip";

const Whims = ({ allPosts }) => {
  const wordCount = allPosts.reduce((total, curPost) => {
    const singlePostWords = curPost.readingTime[1];
    return total + Number(singlePostWords);
  }, 0);

  const initial = { opacity: 0, y: 20 };
  const animate = { opacity: 1, y: 0 };
  const transition = { type: "tween", ease: "easeOut", duration: 0.6 };

  return (
    <Layout title="随想" desc="">
      <div>
        <div className="my-8 items-center flex flex-col sm:flex-row gap-4 justify-between">
          <InView triggerOnce={true}>
            {({ inView, ref }) => (
              <div ref={ref} className="w-full sm:w-1/2 z-5">
                <motion.h1
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={transition}
                  className="my-8 font-extrabold text-6xl w-full leading-relaxed"
                >
                  随想.
                </motion.h1>

                <motion.h1
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={{ ...transition, delay: 0.2 }}
                  className="my-8 font-extrabold text-4xl w-full leading-relaxed text-balance"
                >
                  <strong>{wordCount}字</strong>的无穷尽的不成熟想法和无心快语
                </motion.h1>
              </div>
            )}
          </InView>

          <div className="w-full sm:w-1/2 -translate-y-32 sm:translate-y-0 z-0">
            <InView triggerOnce={true}>
              {({ ref, inView }) => (
                <motion.img
                  ref={ref}
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={{ ...transition, delay: 0.2 }}
                  src="/static/peter-griffin-removebg-preview.png"
                  className="w-full"
                />
              )}
            </InView>
          </div>
        </div>

        <div className="flex flex-row justify-between gap-8">
          <InView triggerOnce={true}>
            {({ inView, ref }) => (
              <motion.div
                ref={ref}
                initial={initial}
                animate={inView ? animate : initial}
                transition={{ ...transition, delay: 0.3 }}
                className="lg:max-w-xl xl:max-w-3xl w-full px-0 md:px-2 lg:px-0"
              >
                <AllPosts posts={allPosts} type="display" />

                <InView triggerOnce={true}>
                  {({ inView: btnInView, ref: btnRef }) => (
                    <Drawer content={<FilterPost allPosts={allPosts} />}>
                      <motion.button
                        ref={btnRef}
                        initial={initial}
                        animate={btnInView ? animate : initial}
                        transition={{ ...transition, delay: 0.4 }}
                        className="flex lg:hidden sticky bottom-4 w-32 mx-auto backdrop-blur-3xl bg-neutral-200 dark:bg-neutral-800 rounded-3xl py-4 flex-row justify-center space-x-2 items-center"
                      >
                        <Tooltip content="筛选依据">
                          <ListFilterIcon className="size-4" />
                        </Tooltip>

                        <span className="font-semibold text-base">
                          筛选文章
                        </span>
                      </motion.button>
                    </Drawer>
                  )}
                </InView>
              </motion.div>
            )}
          </InView>

          <InView triggerOnce={true}>
            {({ inView, ref }) => (
              <motion.div
                ref={ref}
                initial={initial}
                animate={inView ? animate : initial}
                transition={{ ...transition, delay: 0.2 }}
                className="align-self-start hidden lg:block"
              >
                <FilterPost allPosts={allPosts} />
              </motion.div>
            )}
          </InView>
        </div>
      </div>
    </Layout>
  );
};

export default Whims;

export async function getStaticProps() {
  const allPosts = await getAllPosts();
  return {
    props: {
      allPosts,
    },
  };
}
