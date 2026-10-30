import pages from "@/data/pages.json";
import Viewer from "./Viewer";

const title = "Flow – Design Portfolio by Uthpala";

export const metadata = {
  title,
  description: "Creative strategy, trend analysis, design and innovation.",
  openGraph: {
    title,
    images: ["/og.jpg"],
  },
};

export default function Home() {
  return <Viewer pages={pages} />;
}
