"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, Pencil, Plus, Trash2, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import type { Skill } from "@/lib/types";

export default function SkillsTab() {
  const { skills, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Skill | null>(null);
  const [deleting, setDeleting] = useState<Skill | null>(null);
  const [busy, setBusy] = useState(false);

  const categories = Array.from(new Set(skills.map((s) => s.category)));
  const uncat = skills.filter((s) => !categories.includes(s.category));

  const save = async () => {
    if (!editing) return;
    if (!editing.name.trim()) {
      toast({ title: "Skill name required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().saveSkill({
        ...editing,
        category: editing.category.trim() || "Other",
        level: Math.min(100, Math.max(0, Number(editing.level) || 0)),
      });
      await refresh();
      setEditing(null);
      toast({ title: "Skill saved", description: editing.name });
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
      await getStore().deleteSkill(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Skill removed", description: deleting.name });
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

  const renderSkill = (skill: Skill) => (
    <motion.div
      key={skill.id}
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`glass card-hover flex items-center gap-3 rounded-xl p-3 ${
        skill.visible === false ? "opacity-60" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline justify-between gap-2">
          <p className="truncate text-sm font-medium text-starlight">
            {skill.name}
            {skill.visible === false ? (
              <EyeOff className="ml-1.5 inline h-3 w-3 text-[#ff5d7a]" aria-label="hidden" />
            ) : null}
          </p>
          <span className="font-mono text-[11px] text-mint">{skill.level}%</span>
        </div>
        <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo to-mint"
            style={{ width: `${skill.level}%` }}
          />
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-mint"
          onClick={() => setEditing({ ...skill })}
          aria-label={`Edit ${skill.name}`}
        >
          <Pencil className="h-3 w-3" />
        </Button>
        <Button
          size="icon"
          variant="ghost"
          className="h-7 w-7 text-muted-foreground hover:text-[#ff5d7a]"
          onClick={() => setDeleting(skill)}
          aria-label={`Delete ${skill.name}`}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
            <Wrench className="h-5 w-5 text-mint" />
            Skills
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {skills.length} skills · {categories.length} categories
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              id: `skill-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
              name: "",
              category: categories[0] || "Frontend",
              level: 50,
              sort_order: skills.length,
              visible: true,
            })
          }
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Skill
        </Button>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="glass glow-border rounded-2xl p-5">
          <h3 className="font-display mb-4 text-sm font-semibold text-mint">{cat}</h3>
          <div className="grid gap-3 md:grid-cols-2">
            {skills.filter((s) => s.category === cat).map(renderSkill)}
          </div>
        </div>
      ))}
      {uncat.length > 0 ? (
        <div className="glass glow-border rounded-2xl p-5">
          <h3 className="font-display mb-4 text-sm font-semibold text-mint">Other</h3>
          <div className="grid gap-3 md:grid-cols-2">{uncat.map(renderSkill)}</div>
        </div>
      ) : null}

      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-strong max-w-md border-indigo/25">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && skills.some((s) => s.id === editing.id) ? "Edit Skill" : "New Skill"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              name, category and proficiency level
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">SKILL NAME</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="React"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">CATEGORY</Label>
                <Input
                  value={editing.category}
                  onChange={(e) => setEditing({ ...editing, category: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="Frontend / Backend / DevOps & Tools"
                  list="skill-categories"
                />
                <datalist id="skill-categories">
                  {categories.map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs text-mint">PROFICIENCY</Label>
                  <span className="font-mono text-sm font-bold text-mint">{editing.level}%</span>
                </div>
                <Slider
                  value={[editing.level]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(v) => setEditing({ ...editing, level: v[0] })}
                />
                <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo to-mint transition-all"
                    style={{ width: `${editing.level}%` }}
                  />
                </div>
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
                  aria-label="Toggle skill visibility"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-mono text-xs">
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save skill
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="glass-strong border-indigo/25">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-starlight">Remove skill?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Delete “{deleting?.name}” from your list?
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
