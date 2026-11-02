"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, FolderGit2, Github, Pencil, Plus, Star, Trash2 } from "lucide-react";
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
import type { Project } from "@/lib/types";

const GRADIENT_LABELS = ["Indigo Nebula", "Mint Horizon", "Cosmic Duo", "Deep Space", "Aurora"];

function emptyProject(order: number): Project {
  return {
    id: `proj-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    description: "",
    image_url: "",
    gradient: 0,
    tech: [],
    live_url: "",
    repo_url: "",
    featured: false,
    sort_order: order,
    created_at: new Date().toISOString(),
    visible: true,
  };
}

export default function ProjectsTab() {
  const { projects, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Project | null>(null);
  const [deleting, setDeleting] = useState<Project | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().saveProject(editing);
      await refresh();
      setEditing(null);
      toast({ title: "Project saved", description: editing.title });
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
      await getStore().deleteProject(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Project deleted", description: deleting.title });
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
            <FolderGit2 className="h-5 w-5 text-mint" />
            Projects
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {projects.length} projects · {projects.filter((p) => p.featured).length} favourites
          </p>
        </div>
        <Button
          onClick={() => setEditing(emptyProject(projects.length))}
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {projects.map((project, i) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass card-hover flex gap-4 rounded-2xl p-4"
          >
            {/* thumb */}
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl">
              {project.image_url ? (
                <img src={project.image_url} alt="" className="h-full w-full object-cover" />
              ) : (
                <div
                  className={`h-full w-full bg-gradient-to-br ${
                    ["from-[#6331FB] to-[#2a1470]", "from-[#88F9C0] to-[#01010D]", "from-[#8b6bff] to-[#88F9C0]", "from-[#1a0b4d] to-[#8b6bff]", "from-[#6331FB] to-[#0e2a22]"][
                      project.gradient % 5
                    ]
                  } grid place-items-center`}
                >
                  <span className="font-display text-xl font-bold text-white/85">
                    {project.title.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              {project.featured ? (
                <span className="absolute left-1.5 top-1.5 grid h-5 w-5 place-items-center rounded-full bg-onyx/70">
                  <Star className="h-3 w-3 fill-mint text-mint" />
                </span>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-display truncate text-sm font-semibold text-starlight">
                    {project.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {project.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-md border border-indigo/20 bg-indigo/10 px-1.5 py-0.5 font-mono text-[10px] text-indigo-soft">
                  #{project.sort_order + 1}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="flex gap-2 font-mono text-[10px] text-muted-foreground">
                  {project.tech.slice(0, 3).map((t) => (
                    <span key={t} className="rounded bg-white/[0.04] px-1.5 py-0.5">{t}</span>
                  ))}
                  {project.tech.length > 3 ? <span>+{project.tech.length - 3}</span> : null}
                </div>
                <div className="flex items-center gap-1">
                  {project.live_url ? <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                  {project.repo_url ? <Github className="h-3.5 w-3.5 text-muted-foreground" /> : null}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-mint"
                    onClick={() => setEditing({ ...project })}
                    aria-label={`Edit ${project.title}`}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-muted-foreground hover:text-[#ff5d7a]"
                    onClick={() => setDeleting(project)}
                    aria-label={`Delete ${project.title}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* editor dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-strong max-h-[88vh] max-w-2xl overflow-y-auto border-indigo/25">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && projects.some((p) => p.id === editing.id) ? "Edit Project" : "New Project"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              configure project details shown on the portfolio
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label className="font-mono text-xs text-mint">TITLE</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="Nebula Analytics"
                />
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="font-mono text-xs text-mint">DESCRIPTION</Label>
                <Textarea
                  value={editing.description}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                  rows={3}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="What is it, what does it do, what did you achieve?"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">TECH STACK (comma separated)</Label>
                <Input
                  value={editing.tech.join(", ")}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      tech: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                    })
                  }
                  className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                  placeholder="React, Supabase, Tailwind"
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">COVER STYLE</Label>
                <Select
                  value={String(editing.gradient)}
                  onValueChange={(v) => setEditing({ ...editing, gradient: Number(v) })}
                >
                  <SelectTrigger className="border-indigo/25 bg-onyx/50">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="glass-strong border-indigo/25">
                    {GRADIENT_LABELS.map((g, i) => (
                      <SelectItem key={g} value={String(i)}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 sm:col-span-2">
                <Label className="font-mono text-xs text-mint">
                  IMAGE URL <span className="text-muted-foreground">(optional — overrides cover)</span>
                </Label>
                <Input
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">LIVE URL</Label>
                <Input
                  value={editing.live_url}
                  onChange={(e) => setEditing({ ...editing, live_url: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">REPO URL</Label>
                <Input
                  value={editing.repo_url}
                  onChange={(e) => setEditing({ ...editing, repo_url: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="https://github.com/..."
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
                <Label className="font-mono text-xs text-mint">FEATURED (big layout)</Label>
                <Switch
                  checked={editing.featured}
                  onCheckedChange={(v) => setEditing({ ...editing, featured: v })}
                  aria-label="Toggle featured"
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo/20 bg-white/[0.02] px-4 py-2.5">
                <Label className="font-mono text-xs text-mint">VISIBLE ON SITE</Label>
                <Switch
                  checked={editing.visible !== false}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                  aria-label="Toggle project visibility"
                />
              </div>

              <div className="flex justify-end gap-2 sm:col-span-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-mono text-xs">
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save project
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
            <AlertDialogTitle className="font-display text-starlight">
              Delete project?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Delete project “{deleting?.title}”? This cannot be undone.
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
