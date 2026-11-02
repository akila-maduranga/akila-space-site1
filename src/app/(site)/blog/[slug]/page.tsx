import type { Metadata } from "next";
import BlogPostView from "@/components/site/views/BlogPostView";

// The post itself lives in the client-side store (local or Supabase), so a
// static title stands in for crawlers; the browser title is synced by the
// site context once the real post loads.
export const metadata: Metadata = {
  title: "Blog post",
  description: "A post from the blog.",
};

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <BlogPostView slug={slug} />;
}
