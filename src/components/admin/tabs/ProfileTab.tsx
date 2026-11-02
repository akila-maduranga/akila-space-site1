"use client";

import { useState } from "react";
import { Loader2, Save, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";

export default function ProfileTab() {
  const { profile, refresh } = useSite();
  const { toast } = useToast();
  const [form, setForm] = useState(profile);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async () => {
    setBusy(true);
    try {
      await getStore().saveProfile({
        ...form,
        years_experience: Number(form.years_experience) || 0,
        roles: form.roles,
      });
      await refresh();
      toast({
        title: "Profile updated",
        description: "Your changes are now live across the galaxy.",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
            <UserRound className="h-5 w-5 text-mint" />
            Identity Configuration
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            how you appear to visitors across the universe
          </p>
        </div>
        <Button
          onClick={save}
          disabled={busy}
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      <div className="glass glow-border grid gap-6 rounded-2xl p-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="p-name" className="font-mono text-xs text-mint">NAME</Label>
          <Input
            id="p-name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="Ada Lovelace"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-title" className="font-mono text-xs text-mint">TITLE</Label>
          <Input
            id="p-title"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="Full-Stack Developer"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="p-tagline" className="font-mono text-xs text-mint">TAGLINE</Label>
          <Input
            id="p-tagline"
            value={form.tagline}
            onChange={(e) => set("tagline", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="I build things that feel out of this world."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="p-roles" className="font-mono text-xs text-mint">
            HERO TYPEWRITER ROLES <span className="text-muted-foreground">(comma separated)</span>
          </Label>
          <Input
            id="p-roles"
            value={form.roles.join(", ")}
            onChange={(e) =>
              set(
                "roles",
                e.target.value.split(",").map((r) => r.trim()).filter(Boolean)
              )
            }
            className="border-indigo/25 bg-onyx/50 font-mono text-sm"
            placeholder="Full-Stack Developer, UI Engineer, Stargazer"
          />
          <p className="font-mono text-[10px] text-muted-foreground">
            these rotate in the hero headline with a typing effect
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="p-bio" className="font-mono text-xs text-mint">ABOUT — FULL BIO</Label>
          <Textarea
            id="p-bio"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            rows={7}
            className="border-indigo/25 bg-onyx/50"
            placeholder="Your story. Use a blank line to split paragraphs."
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="p-bioshort" className="font-mono text-xs text-mint">ABOUT — SHORT LINE</Label>
          <Input
            id="p-bioshort"
            value={form.bio_short}
            onChange={(e) => set("bio_short", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="One-liner shown in the hero."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-email" className="font-mono text-xs text-mint">EMAIL</Label>
          <Input
            id="p-email"
            type="email"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="hello@you.dev"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-location" className="font-mono text-xs text-mint">LOCATION</Label>
          <Input
            id="p-location"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="Planet Earth · Remote"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-avatar" className="font-mono text-xs text-mint">
            AVATAR URL <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="p-avatar"
            value={form.avatar_url}
            onChange={(e) => set("avatar_url", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="https://... (leave empty for animated initials card)"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-resume" className="font-mono text-xs text-mint">
            RESUME URL <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="p-resume"
            value={form.resume_url}
            onChange={(e) => set("resume_url", e.target.value)}
            className="border-indigo/25 bg-onyx/50"
            placeholder="https://.../resume.pdf"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="p-years" className="font-mono text-xs text-mint">YEARS OF EXPERIENCE</Label>
          <Input
            id="p-years"
            type="number"
            min={0}
            max={99}
            value={form.years_experience}
            onChange={(e) => set("years_experience", Number(e.target.value))}
            className="border-indigo/25 bg-onyx/50"
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="p-r2" className="font-mono text-xs text-mint">
            CLOUDFLARE R2 BASE URL <span className="text-muted-foreground">(optional — gallery helper)</span>
          </Label>
          <Input
            id="p-r2"
            value={form.r2_base_url ?? ""}
            onChange={(e) => set("r2_base_url", e.target.value)}
            className="border-indigo/25 bg-onyx/50 font-mono text-sm"
            placeholder="https://pub-xxxxxxxx.r2.dev"
          />
          <p className="font-mono text-[10px] text-muted-foreground">
            with this set, the Gallery tab accepts bare filenames (e.g. <span className="text-mint">milkyway.jpg</span>)
          </p>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="p-terminal-title" className="font-mono text-xs text-mint">
            TERMINAL WINDOW TITLE <span className="text-muted-foreground">(the hero window)</span>
          </Label>
          <Input
            id="p-terminal-title"
            value={form.terminal_title ?? ""}
            onChange={(e) => set("terminal_title", e.target.value)}
            className="border-indigo/25 bg-onyx/50 font-mono text-sm"
            placeholder="akila@cosmos: ~/portfolio"
          />
          <p className="font-mono text-[10px] text-muted-foreground">
            title bar of the animated terminal card on the home page — leave empty to derive it from your first name
          </p>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-indigo/20 bg-white/[0.02] px-4 py-3">
          <div>
            <Label htmlFor="p-available" className="font-mono text-xs text-mint">
              AVAILABLE FOR WORK
            </Label>
            <p className="mt-1 font-mono text-[10px] text-muted-foreground">
              shows the pulsing badge in the hero
            </p>
          </div>
          <Switch
            id="p-available"
            checked={form.available}
            onCheckedChange={(v) => set("available", v)}
          />
        </div>
      </div>
    </div>
  );
}
