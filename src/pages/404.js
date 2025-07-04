import Layout from "@/components/Layout";
import Error from "@/components/Error";
import { useRouter } from "next/router";

export default function NotFound() {
  const router = useRouter();
  return (
    <Layout title="Error 404(Not Found)!!!">
      <Error
        error={
          <span>
            The requested URL {router.asPath} was not found on this server.
            <span className="opacity-75 ml-1">That’s all we know.</span>
          </span>
        }
      />
    </Layout>
  );
}
