import Layout from "@/components/Layout";

export default function TrafficSign() {
  return (
    <Layout>
      <div className="border-2 rounded-xl w-lg px-8 py-8 bg-[#00A651] text-xl font-medium text-center">
        <div className="flex flex-col items-center">
          <h1>Tsing Yi Link to Disneyland Resort, Tung Chung and Airport</h1>
          <h1 className="mt-2 text-2xl">青嶼幹線往迪士尼、東涌及機場</h1>
        </div>
      </div>
    </Layout>
  );
}
