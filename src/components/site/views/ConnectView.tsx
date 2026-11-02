"use client";

import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";
import PageShell from "../PageShell";
import SocialLinks from "../SocialLinks";
import type { SocialLink } from "@/lib/types";

/** /connect — contact info on a readable panel */
export default function ConnectView() {
  const { profile, socialLinks } = useSite();
  const visible = socialLinks.filter((l) => l.visible !== false);

  const handleLinkClick = (link: SocialLink) => {
    getStore()
      .trackLinkClick(link)
      .catch(() => {});
    const url = link.url;
    if (!url) return;
    if (url.startsWith("mailto:") || url.startsWith("tel:")) {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <PageShell pageKey="connect" panel>
      <SocialLinks profile={profile} socialLinks={visible} onLinkClick={handleLinkClick} />
    </PageShell>
  );
}
