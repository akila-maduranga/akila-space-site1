import type { Metadata } from "next";
import GalleryView from "@/components/site/views/GalleryView";

export const metadata: Metadata = {
  title: "Gallery",
  description: "Photos I'm happy with — hobbyist shots from Sri Lanka and beyond.",
};

export default function GalleryPage() {
  return <GalleryView />;
}
