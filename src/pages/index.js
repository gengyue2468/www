import Layout from "@/components/layouts/Layout";
import OOTFDAY from "@/contents/1024day";
import moment from "moment";
import NormalAboutPage from "@/contents/normalAboutPage";

export default function Home() {
  return (
    <Layout title="BriGriff - I'm thinking">
      {(moment().month() == 9 && moment().date() == 24) ? (
        <OOTFDAY />
      ) : (
        <NormalAboutPage />
      )}
    </Layout>
  );
}
