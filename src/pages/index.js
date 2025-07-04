import Layout from "@/components/Layout";

const Home = () => {
  return (
    <Layout
      title="Geng Yue"
      note={
        <footer>
          <p className="serif italic">“Nothing is impossible.”</p>
          <p className="serif italic mt-2">
            “The happiness of your life depends on the quality of your
            thoughts.”
          </p>
          <p className="serif italic mt-2">
            “Say something positive, and you’ll see something positive.”
          </p>
        </footer>
      }
      sticky={false}
    >
      <div className="mb-8">
        <h1 className="font-semibold mb-6">Geng Yue</h1>

        <p className="mb-4">
          <span className="serif italic mr-1.5">Crafting & Polishing.</span>
          <span>
            I’m a senior high school graduate who is about to go to university.
          </span>
        </p>

        <p className="mb-6">
          <span>
            Since junior high school, I’ve been starting doing freelance
            projects according to my interest. I’m mostly interested in
            combining the useage of
            <span className="italic serif">Artificial Intelligence</span> with
            <span className="serif italic">Web Development</span> for a better
            web.
          </span>
        </p>

        <h1 className="font-semibold mb-6">My Equipments</h1>

        <p className="mb-2">
          Honor GT Pro with Snapdragon 8 Elite chip 12+256GB.
        </p>

        <p className="mb-2">Apple iMac 24’ (2021) with M1 chip 16+512GB.</p>

        <p className="mb-6">
          HP OMEN 11 16’ (2025) with i9-14900HX processor and NVIDIA RTX5070
          graphics 32GB+1TB.
        </p>

        <h1 className="font-semibold mb-6">Contact</h1>

        <p className="mb-2">GitHub: @gengyue2468</p>

        <p className="mb-2">Email: gengyue2468@outlook.com</p>

        <p className="mb-2">Tencent QQ:3041299667</p>

        <p className="mb-2">WeChat: gengyue2468</p>
      </div>
    </Layout>
  );
};

export default Home;
