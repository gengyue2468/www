import HomeLayout from "@/components/layouts/HomeLayout";
import Loader from "@/components/ui/Loader";
import { useRouter } from "next/router";
import { useEffect } from "react";

export default function About() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => router.push("/about"), 50);
  }, []);
  return (
    <HomeLayout title="BriGriff - I'm thinking">
      <Loader />
    </HomeLayout>
  );
}
