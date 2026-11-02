"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Camera,
  Cloud,
  HardDriveDownload,
  ImagePlus,
  Pencil,
  Plus,
  Save,
  Trash2,
} from "lucide-react";
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
import type { Photo } from "@/lib/types";

function resolveUrl(input: string, r2Base: string): string {
  const value = input.trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value) || value.startsWith("/")) return value;
  if (r2Base.trim()) {
    const base = r2Base.trim().replace(/\/+$/, "");
    return `${base}/${value.replace(/^\/+/, "")}`;
  }
  return value;
}

export default function PhotosTab() {
  const { photos, profile, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<Photo | null>(null);
  const [deleting, setDeleting] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);
  const [r2Base, setR2Base] = useState(profile.r2_base_url ?? "");
  const [r2Busy, setR2Busy] = useState(false);

  const categories = useMemo(() => {
    const set = new Set<string>();
    photos.forEach((p) => p.category && set.add(p.category));
    ["Astrophotography", "Landscape", "Portrait", "Street"].forEach((c) => set.add(c));
    return Array.from(set);
  }, [photos]);

  const saveR2Base = async () => {
    setR2Busy(true);
    try {
      await getStore().saveProfile({ ...profile, r2_base_url: r2Base.trim() });
      await refresh();
      toast({
        title: "R2 base URL saved",
        description: r2Base.trim()
          ? "New photos can now be added by filename only."
          : "R2 helper disabled — full URLs required.",
      });
    } catch (err) {
      toast({
        title: "Save failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setR2Busy(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    const url = resolveUrl(editing.image_url, profile.r2_base_url || r2Base);
    if (!url) {
      toast({ title: "Image URL required", variant: "destructive" });
      return;
    }
    if (!editing.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().savePhoto({
        ...editing,
        title: editing.title.trim(),
        image_url: url,
        sort_order: Number(editing.sort_order) || 0,
      });
      await refresh();
      setEditing(null);
      toast({ title: "Photo saved", description: editing.title });
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
      await getStore().deletePhoto(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Photo removed", description: deleting.title });
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

  const previewUrl = editing ? resolveUrl(editing.image_url, profile.r2_base_url || r2Base) : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
            <Camera className="h-5 w-5 text-mint" />
            Photography Gallery
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {photos.length} frames · served from{" "}
            {profile.r2_base_url ? (
              <span className="text-mint">Cloudflare R2</span>
            ) : (
              "local / any URL"
            )}
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              id: `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
              title: "",
              caption: "",
              category: "Landscape",
              image_url: "",
              sort_order: photos.length,
              created_at: new Date().toISOString(),
              visible: true,
            })
          }
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Photo
        </Button>
      </div>

      {/* Cloudflare R2 helper */}
      <div className="glass rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#f6821f]/25 to-mint/10 text-[#f6821f]">
              <Cloud className="h-5 w-5" />
            </span>
            <div>
              <p className="font-display text-sm font-semibold text-starlight">
                Cloudflare R2 base URL
              </p>
              <p className="font-mono text-[10px] text-muted-foreground">
                set it once, then add photos by filename only
              </p>
            </div>
          </div>
          <div className="flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
            <Input
              value={r2Base}
              onChange={(e) => setR2Base(e.target.value)}
              placeholder="https://pub-xxxxxxxx.r2.dev"
              className="w-full border-indigo/25 bg-onyx/50 font-mono text-xs sm:max-w-sm"
              aria-label="Cloudflare R2 public base URL"
            />
            <Button
              onClick={saveR2Base}
              disabled={r2Busy}
              size="sm"
              className="shrink-0 bg-gradient-to-r from-[#f6821f] to-[#f6821f]/80 font-mono text-xs text-white hover:shadow-[0_8px_28px_rgba(246,130,31,0.4)]"
            >
              <Save className="h-3.5 w-3.5" />
              save
            </Button>
          </div>
        </div>
        {!profile.r2_base_url ? (
          <p className="mt-3 flex items-start gap-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
            <HardDriveDownload className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-soft" />
            R2 dashboard → your bucket → Settings → Public access → enable the{" "}
            <span className="text-mint">r2.dev</span> subdomain (or connect a custom domain), then
            paste it above. Full URLs always work too.
          </p>
        ) : null}
      </div>

      {/* photo grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
        {photos.map((photo, i) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`glass card-hover group relative overflow-hidden rounded-2xl ${
              photo.visible === false ? "opacity-60" : ""
            }`}
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              { }
              <img
                src={photo.image_url}
                alt={photo.title}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                draggable={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-onyx/90 via-transparent to-transparent opacity-80" />
              <span className="absolute right-2 top-2 rounded-md border border-mint/25 bg-onyx/70 px-1.5 py-0.5 font-mono text-[9px] text-mint backdrop-blur-sm">
                #{photo.sort_order + 1}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2 p-3">
              <div className="min-w-0">
                <p className="truncate font-display text-xs font-semibold text-starlight">
                  {photo.title}
                  {photo.visible === false ? (
                    <span className="ml-1.5 rounded border border-[#ff5d7a]/30 bg-[#ff5d7a]/10 px-1 py-px font-mono text-[8px] text-[#ff5d7a]">
                      hidden
                    </span>
                  ) : null}
                </p>
                <p className="truncate font-mono text-[9px] text-muted-foreground">
                  {photo.category}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-mint"
                  onClick={() => setEditing({ ...photo })}
                  aria-label={`Edit ${photo.title}`}
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-muted-foreground hover:text-[#ff5d7a]"
                  onClick={() => setDeleting(photo)}
                  aria-label={`Delete ${photo.title}`}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* add card */}
        <button
          onClick={() =>
            setEditing({
              id: `photo-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
              title: "",
              caption: "",
              category: "Landscape",
              image_url: "",
              sort_order: photos.length,
              created_at: new Date().toISOString(),
              visible: true,
            })
          }
          className="glass card-hover grid aspect-[4/3] place-items-center rounded-2xl border-dashed text-muted-foreground transition-colors hover:text-mint"
          aria-label="Add new photo"
        >
          <span className="flex flex-col items-center gap-2">
            <ImagePlus className="h-7 w-7" />
            <span className="font-mono text-[10px]">add frame</span>
          </span>
        </button>
      </div>

      {/* editor dialog */}
      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-strong max-h-[90vh] overflow-y-auto border-indigo/25">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && photos.some((p) => p.id === editing.id) ? "Edit Photo" : "New Photo"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              images can live on Cloudflare R2 or anywhere public
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              {previewUrl ? (
                <div className="relative overflow-hidden rounded-xl border border-indigo/20">
                  { }
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-44 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.opacity = "0.15";
                    }}
                  />
                </div>
              ) : null}

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">TITLE</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="Milky Way Core"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-mint">CATEGORY</Label>
                  <Select
                    value={editing.category}
                    onValueChange={(v) => setEditing({ ...editing, category: v })}
                  >
                    <SelectTrigger className="border-indigo/25 bg-onyx/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="glass-strong max-h-52 overflow-y-auto border-indigo/25">
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">
                  IMAGE URL{" "}
                  {profile.r2_base_url ? (
                    <span className="text-muted-foreground">
                      · filename only works ({profile.r2_base_url.replace(/^https?:\/\//, "")}/…)
                    </span>
                  ) : null}
                </Label>
                <Input
                  value={editing.image_url}
                  onChange={(e) => setEditing({ ...editing, image_url: e.target.value })}
                  className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                  placeholder={
                    profile.r2_base_url
                      ? "milkyway-core.jpg"
                      : "https://pub-xxxx.r2.dev/milkyway-core.jpg"
                  }
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">CAPTION</Label>
                <Textarea
                  value={editing.caption}
                  onChange={(e) => setEditing({ ...editing, caption: e.target.value })}
                  className="border-indigo/25 bg-onyx/50 text-sm"
                  placeholder="Where it was taken, gear used, the story of the frame…"
                  rows={3}
                />
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo/20 bg-white/[0.02] px-4 py-2.5">
                <div>
                  <Label className="font-mono text-xs text-mint">VISIBLE IN GALLERY</Label>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    hidden photos stay saved here
                  </p>
                </div>
                <Switch
                  checked={editing.visible !== false}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                  aria-label="Toggle photo visibility"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-mono text-xs">
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save frame
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
            <AlertDialogTitle className="font-display text-starlight">Delete frame?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Remove “{deleting?.title}” from the gallery?
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
