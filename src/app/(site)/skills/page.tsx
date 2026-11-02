import type { Metadata } from "next";
import SkillsView from "@/components/site/views/SkillsView";

export const metadata: Metadata = {
  title: "Skills",
  description: "The toolbox, honestly rated — no fake percentages.",
};

export default function SkillsPage() {
  return <SkillsView />;
}
