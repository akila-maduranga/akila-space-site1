"use client";

import { SiteProvider } from "@/lib/site-context";
import PortfolioSite from "@/components/site/PortfolioSite";

export default function AppShell() {
  return (
    <SiteProvider>
      {/* NOTE: no background color here on purpose — an opaque bg on this
          wrapper would paint OVER the fixed -z-10 starfield/Vanta layers
          (non-positioned block backgrounds paint above negative z-index
          elements), leaving the whole animated background invisible.
          The base color comes from the body style in globals.css. */}
      <div className="flex min-h-screen flex-col text-foreground">
        <PortfolioSite />
      </div>
    </SiteProvider>
  );
}
