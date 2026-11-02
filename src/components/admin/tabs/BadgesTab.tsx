"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
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
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";
import { FACT_ICONS, FACT_ICON_KEYS, FactIcon } from "@/lib/icons";
import type { Fact } from "@/lib/types";

/**
 * Edits the little badge cards on the About page
 * ("currently into", "cameras owned", ...).
 */
export default function BadgesTab() {
  const { facts, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Fact | null>(null);
  const [deleting, setDeleting] = useState<Fact | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!editing) return;
    if (!editing.label.trim()) {
      toast({ title: "Badge label required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().saveFact({
        ...editing,
        label: editing.label.trim(),
        value: editing.value.trim(),
        icon: FACT_ICONS[editing.icon] ? editing.icon : "sparkles",
        sort_order: Number(editing.sort_order) || 0,
      });
      await refresh();
      setEditing(null);
      toast({ title: "Badge saved", description: editing.label });
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
      await getStore().deleteFact(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Badge removed", description: deleting.label });
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
            <BadgeCheck className="h-5 w-5 text-mint" />
            Badges
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {facts.length} badges on the about page · icon, label & value
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              id: `fact-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
              icon: "sparkles",
              label: "",
              value: "",
              sort_order: facts.length,
              visible: true,
            })
          }
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Badge
        </Button>
      </div>

      <div className="glass glow-border rounded-2xl p-5">
        {facts.length === 0 ? (
          <p className="py-8 text-center font-mono text-xs text-muted-foreground">
            no badges yet — add one with “New Badge”
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {facts.map((fact) => (
              <motion.div
                key={fact.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`glass card-hover flex items-center gap-3 rounded-xl p-3 ${
                  fact.visible === false ? "opacity-60" : ""
                }`}
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-indigo/15 text-indigo-soft">
                  <FactIcon icon={fact.icon} className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                    {fact.label || "untitled"}
                    {fact.visible === false ? (
                      <EyeOff className="ml-1.5 inline h-3 w-3 text-[#ff5d7a]" aria-label="hidden" />
                    ) : null}
                  </p>
                  <p className="truncate text-sm font-medium text-starlight">{fact.value}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-mint"
                    onClick={() => setEditing({ ...fact })}
                    aria-label={`Edit ${fact.label}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-[#ff5d7a]"
                    onClick={() => setDeleting(fact)}
                    aria-label={`Delete ${fact.label}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-strong max-w-md border-indigo/25">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && facts.some((f) => f.id === editing.id) ? "Edit Badge" : "New Badge"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              the little cards under your bio on the about page
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">ICON</Label>
                <div className="grid grid-cols-9 gap-1.5 rounded-xl border border-indigo/20 bg-white/[0.02] p-2">
                  {FACT_ICON_KEYS.map((key) => {
                    const selected = editing.icon === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setEditing({ ...editing, icon: key })}
                        aria-label={key}
                        aria-pressed={selected}
                        className={`grid aspect-square place-items-center rounded-lg transition-all ${
                          selected
                            ? "bg-indigo/30 text-mint shadow-[inset_0_0_0_1px_rgba(136,249,192,0.4)]"
                            : "text-muted-foreground hover:bg-white/[0.06] hover:text-starlight"
                        }`}
                      >
                        <FactIcon icon={key} className="h-4 w-4" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">LABEL</Label>
                <Input
                  value={editing.label}
                  onChange={(e) => setEditing({ ...editing, label: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="currently into"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">VALUE</Label>
                <Input
                  value={editing.value}
                  onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="next.js, self-hosting & old lenses"
                />
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
                <Label className="font-mono text-xs text-mint">VISIBLE ON SITE</Label>
                <Switch
                  checked={editing.visible !== false}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                  aria-label="Toggle badge visibility"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-mono text-xs">
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save badge
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="glass-strong border-indigo/25">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-starlight">Remove badge?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Delete “{deleting?.label}” from the about page?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-mono text-xs">keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={remove}
              className="bg-[#ff5d7a] font-mono text-xs hover:bg-[#ff5d7a]/85"
            >
              delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
