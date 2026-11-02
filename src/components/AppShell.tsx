"use client";

import { SiteProvider } from "@/lib/site-context";
import PortfolioSite from "@/components/site/PortfolioSite";

export default function AppShell() {
  return (
    <SiteProvider>
      <div className="flex min-h-screen flex-col bg-onyx text-foreground">
        <PortfolioSite />
      </div>
    </SiteProvider>
  );
}
