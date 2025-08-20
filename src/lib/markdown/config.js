import Image from "@/components/Image";
import NextLink from "@/components/NextLink";
import { SegmentContainer } from "@/components/SegmentControl";
import Video from "@/components/Video";
import Footnote from "@/components/Footnotes";

const mdxComponents = {
  img: Image,
  a: NextLink,
  Footnotes: Footnote,
  Video,
  SegmentContainer,
};
export { mdxComponents };
