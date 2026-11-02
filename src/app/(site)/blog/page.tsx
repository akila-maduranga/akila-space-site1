import type { Metadata } from "next";
import BlogView from "@/components/site/views/BlogView";

export const metadata: Metadata = {
  title: "Blog",
  description: "Notes and updates on new stuff I'm doing.",
};

export default function BlogPage() {
  return <BlogView />;
}
