"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Briefcase, EyeOff, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import type { Experience } from "@/lib/types";

export default function ExperienceTab() {
  const { experiences, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Experience | null>(null);
  const [deleting, setDeleting] = useState<Experience | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!editing) return;
    if (!editing.role.trim() || !editing.company.trim()) {
      toast({ title: "Role and company are required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().saveExperience({
        ...editing,
        end_date: editing.current ? "" : editing.end_date,
      });
      await refresh();
      setEditing(null);
      toast({ title: "Entry saved", description: `${editing.role} @ ${editing.company}` });
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
      await getStore().deleteExperience(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Entry removed", description: `${deleting.role} @ ${deleting.company}` });
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
            <Briefcase className="h-5 w-5 text-mint" />
            Journey
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {experiences.length} milestones · shown on the timeline
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              id: `exp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
              role: "",
              company: "",
              description: "",
              start_date: String(new Date().getFullYear()),
              end_date: "",
              current: false,
              sort_order: experiences.length,
              visible: true,
            })
          }
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Entry
        </Button>
      </div>

      <div className="space-y-4">
        {experiences.map((exp, i) => (
          <motion.div
            key={exp.id}
            initial={{ opacity: 0, x: -18 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`glass card-hover flex items-start gap-4 rounded-2xl p-5 ${
              exp.visible === false ? "opacity-60" : ""
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-indigo/15 text-indigo-soft">
              <Briefcase className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-display text-sm font-semibold text-starlight">{exp.role}</p>
                {exp.current ? (
                  <span className="rounded-full border border-mint/30 bg-mint/[0.08] px-2 py-0.5 font-mono text-[9px] text-mint">
                    still going
                  </span>
                ) : null}
                {exp.visible === false ? (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#ff5d7a]/30 bg-[#ff5d7a]/10 px-2 py-0.5 font-mono text-[9px] text-[#ff5d7a]">
                    <EyeOff className="h-2.5 w-2.5" /> hidden
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 font-mono text-xs text-indigo-soft">{exp.company}</p>
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                {exp.description}
              </p>
              <p className="mt-2 font-mono text-[10px] text-muted-foreground">
                {exp.start_date} → {exp.current ? "present" : exp.end_date || "?"} · order #{exp.sort_order + 1}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-mint"
                onClick={() => setEditing({ ...exp })}
                aria-label={`Edit ${exp.role}`}
              >
                <Pencil className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-muted-foreground hover:text-[#ff5d7a]"
                onClick={() => setDeleting(exp)}
                aria-label={`Delete ${exp.role}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-strong max-w-lg border-indigo/25">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && experiences.some((e) => e.id === editing.id) ? "Edit Entry" : "New Entry"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              a milestone on your journey — first camera, first site, new obsession…
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">ROLE</Label>
                <Input
                  value={editing.role}
                  onChange={(e) => setEditing({ ...editing, role: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="First proper camera"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">SUBTITLE</Label>
                <Input
                  value={editing.company}
                  onChange={(e) => setEditing({ ...editing, company: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="the photography bug"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="font-mono text-xs text-mint">DESCRIPTION</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="What happened, what you learned, why it mattered."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">START (year)</Label>
                <Input
                  value={editing.start_date}
                  onChange={(e) => setEditing({ ...editing, start_date: e.target.value })}
                  className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                  placeholder="2022"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">END (year)</Label>
                <Input
                  value={editing.end_date}
                  disabled={editing.current}
                  onChange={(e) => setEditing({ ...editing, end_date: e.target.value })}
                  className="border-indigo/25 bg-onyx/50 font-mono text-sm disabled:opacity-40"
                  placeholder="2024"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo/20 bg-white/[0.02] px-4 py-2.5">
                <Label className="font-mono text-xs text-mint">STILL ONGOING</Label>
                <Switch
                  checked={editing.current}
                  onCheckedChange={(v) => setEditing({ ...editing, current: v })}
                  aria-label="Toggle ongoing"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo/20 bg-white/[0.02] px-4 py-2.5">
                <Label className="font-mono text-xs text-mint">VISIBLE ON SITE</Label>
                <Switch
                  checked={editing.visible !== false}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                  aria-label="Toggle entry visibility"
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

              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-mono text-xs">
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save entry
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="glass-strong border-indigo/25">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-starlight">Remove entry?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Delete “{deleting?.role}” from the timeline?
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
