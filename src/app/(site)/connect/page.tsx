import type { Metadata } from "next";
import ConnectView from "@/components/site/views/ConnectView";

export const metadata: Metadata = {
  title: "Connect",
  description: "Say hi — inboxes open, no pitch required.",
};

export default function ConnectPage() {
  return <ConnectView />;
}
