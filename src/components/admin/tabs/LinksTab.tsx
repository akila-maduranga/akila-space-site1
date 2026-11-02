"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Eye, EyeOff, MousePointerClick, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";
import type { SocialLink } from "@/lib/types";
import { PLATFORM_KEYS, PLATFORM_META, PlatformIcon } from "@/lib/icons";

export default function LinksTab() {
  const { socialLinks, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [deleting, setDeleting] = useState<SocialLink | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!editing) return;
    if (!editing.url.trim()) {
      toast({ title: "URL required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().saveSocialLink({
        ...editing,
        label:
          editing.label.trim() ||
          PLATFORM_META[editing.platform]?.label ||
          "Link",
      });
      await refresh();
      setEditing(null);
      toast({ title: "Link saved", description: editing.label });
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

  const remove = async () => {
    if (!deleting) return;
    setBusy(true);
    try {
      await getStore().deleteSocialLink(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Link removed", description: deleting.label });
    } catch (err) {
      toast({
        title: "Delete failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  };

  const totalClicks = socialLinks.reduce((s, l) => s + (l.clicks || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
            <BarChart3 className="h-5 w-5 text-mint" />
            Social Links
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {socialLinks.length} links · {totalClicks.toLocaleString()} tracked clicks
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              id: `link-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
              platform: "github",
              label: "GitHub",
              url: "",
              sort_order: socialLinks.length,
              clicks: 0,
              visible: true,
            })
          }
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Link
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {socialLinks.map((link, i) => {
          const meta = PLATFORM_META[link.platform] || PLATFORM_META.other;
          return (
            <motion.div
              key={link.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass card-hover rounded-2xl p-4 ${link.visible === false ? "opacity-60" : ""}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-indigo/20 bg-white/[0.04]"
                  style={{ color: meta.color }}
                >
                  <PlatformIcon platform={link.platform} className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display truncate text-sm font-semibold text-starlight">
                    {link.label}
                  </p>
                  <p className="truncate font-mono text-[10px] text-muted-foreground">
                    {link.url.replace(/^mailto:/, "").replace(/^https?:\/\/(www\.)?/, "")}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-mint/25 bg-mint/[0.07] px-2 py-1 font-mono text-[10px] text-mint">
                  #{link.sort_order + 1}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between border-t border-indigo/10 pt-3">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                  {link.visible === false ? (
                    <>
                      <EyeOff className="h-3.5 w-3.5 text-[#ff5d7a]" /> hidden
                    </>
                  ) : (
                    <>
                      <MousePointerClick className="h-3.5 w-3.5 text-mint" />
                      {(link.clicks || 0).toLocaleString()} clicks
                    </>
                  )}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-mint"
                    onClick={() => setEditing({ ...link })}
                    aria-label={`Edit ${link.label}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-[#ff5d7a]"
                    onClick={() => setDeleting(link)}
                    aria-label={`Delete ${link.label}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* editor dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-strong max-w-lg border-indigo/25">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && socialLinks.some((l) => l.id === editing.id) ? "Edit Link" : "New Link"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              clicks on this link are tracked automatically
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">PLATFORM</Label>
                <Select
                  value={editing.platform}
                  onValueChange={(v) =>
                    setEditing({ ...editing, platform: v, label: PLATFORM_META[v]?.label || editing.label })
                  }
                >
                  <SelectTrigger className="border-indigo/25 bg-onyx/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong max-h-64 overflow-y-auto border-indigo/25">
                    {PLATFORM_KEYS.map((key) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          <PlatformIcon platform={key} className="h-4 w-4" />
                          {PLATFORM_META[key]?.label || key}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">LABEL</Label>
                <Input
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="GitHub"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">URL</Label>
                <Input
                  value={editing.url}
                  onChange={(e) => setEditing({ ...editing, url: e.target.value })}
                  className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                  placeholder="https://github.com/you"
                />
                <p className="font-mono text-[10px] text-muted-foreground">
                  use mailto:you@dev.com for email links
                </p>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">SORT ORDER</Label>
                <Input
                  type="number"
                  min={0}
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  className="border-indigo/25 bg-onyx/50"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo/20 bg-white/[0.02] px-4 py-2.5">
                <div>
                  <Label className="font-mono text-xs text-mint">VISIBLE ON SITE</Label>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    hidden links keep their click history
                  </p>
                </div>
                <Switch
                  checked={editing.visible !== false}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                  aria-label="Toggle link visibility"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-mono text-xs">
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save link
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      {/* delete confirm */}
      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="glass-strong border-indigo/25">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-starlight">Remove link?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Remove “{deleting?.label}” from your link grid?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-[#ff5d7a] font-mono text-xs hover:bg-[#ff5d7a]/85"
            >
              remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
