import type { Metadata } from "next";
import ProjectsView from "@/components/site/views/ProjectsView";

export const metadata: Metadata = {
  title: "Projects",
  description: "Things I've built — some useful, some just fun.",
};

export default function ProjectsPage() {
  return <ProjectsView />;
}
