import type { Metadata } from "next";
import { SiteProvider } from "@/lib/site-context";
import AdminApp from "@/components/admin/AdminApp";
import StarfieldBackground from "@/components/site/StarfieldBackground";

export const metadata: Metadata = {
  title: "Admin",
  description: "Private admin area.",
  robots: { index: false, follow: false },
};

/**
 * The admin dashboard lives here — deliberately unlinked from the public
 * site (no button anywhere). You just have to know the address.
 */
export default function AdminPage() {
  return (
    <SiteProvider>
      <div className="flex min-h-screen flex-col bg-onyx text-foreground">
        <StarfieldBackground />
        <AdminApp />
      </div>
    </SiteProvider>
  );
}
