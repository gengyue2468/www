import Layout from "@/components/layouts/Layout";

export default function Error() {
  return (
    <Layout title="404 - 页面未找到">
      <h1 className="mt-8 mb-4">404 - 页面未找到</h1>

      <p>此页面无法被找到或者动态生成</p>
    </Layout>
  );
}
