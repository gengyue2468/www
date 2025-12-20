import { Link } from "react-router";
import { Image } from "@/components/public/img/image";

export default function Location() {
  return (
    <section className="mt-4 relative">
      <Link
        className="my-0 no-underline! hover:opacity-100!"
        to="https://www.google.com/maps/place/%E5%8D%8E%E4%B8%AD%E7%A7%91%E6%8A%80%E5%A4%A7%E5%AD%A6/@30.6260532,114.214542,11.25z/data=!4m6!3m5!1s0x342ea4a4f8a230e9:0xf42f097ec953d0b1!8m2!3d30.5130043!4d114.4202756!16zL20vMDQ4bjRt?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D"
      >
        <Image src="/static/cover/map.webp" alt="我的位置" loading="lazy" />
      </Link>
    </section>
  );
}
