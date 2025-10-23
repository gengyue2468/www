import { InView } from "react-intersection-observer";
import { motion } from "motion/react";

import { device, contact, webTech } from "@/lib/home.config";
import { useRouter } from "next/router";

export default function NormalAboutPage() {
  const router = useRouter();
  const initial = { opacity: 0, y: 20 };
  const animate = { opacity: 1, y: 0 };
  const transition = { type: "tween", ease: "easeOut", duration: 0.6 };
  return (
    <>
      <div className="mt-8 items-center flex flex-col sm:flex-row gap-4 justify-between h-[90vh]">
        <InView triggerOnce={true}>
          {({ inView, ref }) => (
            <div ref={ref} className="w-full sm:w-1/2 z-5">
              <motion.h1
                initial={initial}
                animate={inView ? animate : initial}
                transition={transition}
                className="my-8 font-extrabold text-4xl w-full leading-relaxed"
              >
                华中<strong>柯基大学</strong>，本科生，是<strong>基柯</strong>生
              </motion.h1>

              <motion.h1
                initial={initial}
                animate={inView ? animate : initial}
                transition={{ ...transition, delay: 0.2 }}
                className="my-8 font-extrabold text-4xl w-full leading-relaxed"
              >
                是<strong>大一</strong>，是<strong>小东西</strong>
              </motion.h1>

              <motion.h1
                initial={initial}
                animate={inView ? animate : initial}
                transition={{ ...transition, delay: 0.4 }}
                className="my-8 font-extrabold text-4xl w-full leading-relaxed"
              >
                <a href="https://www.bingyan.net">冰岩作坊</a> 前端组
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
                src="/static/chris-griffin.png"
                className="w-full"
              />
            )}
          </InView>
        </div>
      </div>
      <div className="">
        <InView triggerOnce={true}>
          {({ inView, ref }) => (
            <div ref={ref} className="w-full sm:w-1/2 z-5 mt-16">
              <motion.h1
                initial={initial}
                animate={inView ? animate : initial}
                transition={transition}
                className="my-8 font-extrabold text-2xl sm:text-4xl w-full leading-relaxed"
              >
                设备列表
              </motion.h1>
            </div>
          )}
        </InView>

        <div className="flex flex-row flex-wrap gap-4">
          {device.map((item, index) => (
            <InView threshold={0.5} key={index} triggerOnce={true}>
              {({ inView, ref }) => (
                <motion.div
                  ref={ref}
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={{ ...transition, delay: 0.1 * (index + 1) }}
                  className={`w-full sm:w-80 bg-neutral-100 dark:bg-neutral-900 rounded-3xl items-center text-center px-12 py-8 flex flex-col justify-between flex-shrink-0 ${
                    item.outdate && "opacity-50"
                  }`}
                >
                  <div className="flex items-center h-full">
                    <img src={item.pic} className="rounded-3xl w-auto" />
                  </div>

                  <div>
                    <h1 className="font-bold text-3xl mt-8">
                      {item.brand} {item.device}
                    </h1>

                    <p className="mt-4 font-semibold opacity-50 text-xl">
                      {item.cpu} <br />
                      {item.ram} + {item.rom}
                    </p>
                  </div>
                </motion.div>
              )}
            </InView>
          ))}
        </div>
      </div>

      <div className="">
        <InView triggerOnce={true}>
          {({ inView, ref }) => (
            <div ref={ref} className="w-full sm:w-1/2 z-5 mt-16">
              <motion.h1
                initial={initial}
                animate={inView ? animate : initial}
                transition={transition}
                className="my-8 font-extrabold text-2xl sm:text-4xl w-full leading-relaxed"
              >
                联系我
              </motion.h1>
            </div>
          )}
        </InView>

        <div className="flex flex-row flex-wrap gap-4">
          {contact.map((item, index) => (
            <InView key={index} triggerOnce={true}>
              {({ inView, ref }) => (
                <motion.div
                  ref={ref}
                  onClick={() => (item.href ? router.push(item.href) : null)}
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={{ ...transition, delay: 0.1 * (index + 1) }}
                  className={`w-full sm:w-80 bg-neutral-100 dark:bg-neutral-900 rounded-3xl items-center text-center px-12 py-8 flex flex-col justify-between flex-shrink-0
                  ${item.outdate && "opacity-50"}}`}
                >
                  <div className="flex items-center h-full">{item.icon}</div>

                  <div>
                    <h1 className="font-bold text-3xl mt-8">{item.title}</h1>
                    <div className="mt-4 font-semibold opacity-50 text-xl bg-white dark:bg-black rounded-full px-3 py-2">
                      {item.content}
                    </div>
                  </div>
                </motion.div>
              )}
            </InView>
          ))}
        </div>
      </div>

      <div className="">
        <InView triggerOnce={true}>
          {({ inView, ref }) => (
            <div ref={ref} className="w-full sm:w-1/2 z-5 mt-16">
              <motion.h1
                initial={initial}
                animate={inView ? animate : initial}
                transition={transition}
                className="my-8 font-extrabold text-2xl sm:text-4xl w-full leading-relaxed"
              >
                网站技术
              </motion.h1>
            </div>
          )}
        </InView>

        <div className="flex flex-row flex-wrap gap-4">
          {webTech.map((item, index) => (
            <InView key={index} triggerOnce={true}>
              {({ inView, ref }) => (
                <motion.div
                  ref={ref}
                  initial={initial}
                  animate={inView ? animate : initial}
                  transition={{ ...transition, delay: 0.1 * (index + 1) }}
                  className={`w-full sm:w-80 bg-neutral-100 dark:bg-neutral-900 rounded-3xl items-center text-center px-12 py-8 flex flex-col justify-between flex-shrink-0
                  }`}
                >
                  <div className="flex items-center h-full">{item.icon}</div>

                  <div>
                    <h1 className="font-bold text-3xl mt-8">{item.name}</h1>
                    <div className="mt-4 font-semibold opacity-50 text-xl bg-white dark:bg-black rounded-full px-3 py-2">
                      {item.type}
                    </div>
                  </div>
                </motion.div>
              )}
            </InView>
          ))}
        </div>
      </div>
    </>
  );
}
