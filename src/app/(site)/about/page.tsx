import type { Metadata } from "next";
import AboutView from "@/components/site/views/AboutView";

export const metadata: Metadata = {
  title: "About",
  description: "Who I am, in slightly too many words — the person behind this corner of the internet.",
};

export default function AboutPage() {
  return <AboutView />;
}
