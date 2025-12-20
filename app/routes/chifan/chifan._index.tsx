import { Header, OpenSource, Tab } from "@/components/chifan";
import RouterBack from "@/components/public/route/route-back";
import type { Route } from "./+types/chifan._index";
import { loadCanteenData, loadCanteenStatus } from "@/loaders/canteen";
import { useLoaderData } from "react-router";
import type { Canteen, kaifanStatus } from "@/types/canteen";

export async function loader({}: Route.LoaderArgs) {
  const openedCanteen = loadCanteenData();
  const kaifanStatus = loadCanteenStatus();
  return {
    openedCanteen,
    kaifanStatus,
  };
}

export default function ChifanIndex() {
  const { openedCanteen, kaifanStatus } = useLoaderData() as {
    openedCanteen: Canteen[];
    kaifanStatus: kaifanStatus[];
  };
  return (
    <>
      <RouterBack to="/" />
      <Header />
      <Tab openedCanteen={openedCanteen} kaifanStatus={kaifanStatus} />
      <OpenSource />
    </>
  );
}
