import type { Metadata } from "next";
import { SiteProvider } from "@/lib/site-context";
import SiteChrome from "@/components/site/SiteChrome";

/**
 * Layout for every public page of the site. The provider + chrome live
 * here (not in each page) so the animated background, navbar and footer
 * persist across navigations — moving between pages swaps only the
 * content inside <main>, and the Vanta effect never re-initialises.
 */
export const metadata: Metadata = {
  title: {
    default: "Akila Maduranga — Tech Enthusiast & Hobbyist Photographer",
    template: "%s · Akila Maduranga",
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SiteProvider>
      <SiteChrome>{children}</SiteChrome>
    </SiteProvider>
  );
}
