// pages/auth/signin.js
import { getProviders, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/Layout";
import { GitHubIcon } from "@/components/Icon";

export default function SignIn({ providers }) {
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (router.query.error) {
      setError(
        router.query.error === "OAuthAccountNotLinked"
          ? "This email is already associated with another account"
          : "Authentication failed, please try again"
      );
    }
  }, [router.query]);

  return (
    <Layout title="登录 GitHub 以继续" desc="评论系统登录页">
      <h1 className="leading-relaxed">
        <span className="leading-relaxed text-balance mb-2 font-semibold text-2xl sm:text-3xl">
          还差一步。
          <br />
          <span>为了使用评论系统，</span>
          <br />
          我们需要您完成登录流程
        </span>
      </h1>

      <h2 className="font-medium opacity-50 text-base sm:text-lg my-8">
        请坐和放宽，这不需要太多时间
      </h2>
      {Object.values(providers).map((provider) => (
        <button
          key={provider.id}
          onClick={() => signIn(provider.id, { callbackUrl: "/" })}
          className="cursor-pointer w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-black text-white dark:bg-white dark:text-black"
        >
          <GitHubIcon className="size-6" />
          <span>使用{provider.name}登录</span>
        </button>
      ))}
    </Layout>
  );
}

export async function getServerSideProps(context) {
  const providers = await getProviders();
  return {
    props: { providers },
  };
}
