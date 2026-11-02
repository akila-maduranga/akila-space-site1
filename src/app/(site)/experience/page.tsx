import type { Metadata } from "next";
import ExperienceView from "@/components/site/views/ExperienceView";

export const metadata: Metadata = {
  title: "Experience",
  description: "Where I've been and what I picked up along the way.",
};

export default function ExperiencePage() {
  return <ExperienceView />;
}
