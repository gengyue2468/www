import Layout from "@/components/layouts/Layout";

export default function Error() {
  return (
    <Layout title="500 - 内部服务器错误">
      <h1 className="mt-8 mb-4">500 - 内部服务器错误</h1>

      <p>不是你，而是我们。内部服务器发生故障</p>
    </Layout>
  );
}