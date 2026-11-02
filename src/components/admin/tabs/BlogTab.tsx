"use client";

import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Eye,
  EyeOff,
  PenLine,
  Pencil,
  Plus,
  RefreshCw,
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
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";
import { Markdown } from "@/lib/markdown";
import type { BlogPost } from "@/lib/types";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDate(value: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export default function BlogTab() {
  const { posts, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [deleting, setDeleting] = useState<BlogPost | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const slugTouched = useRef(false);

  const sorted = useMemo(
    () => [...posts].sort((a, b) => (b.published_at || "").localeCompare(a.published_at || "")),
    [posts]
  );

  const newPost = (): BlogPost => ({
    id: `post-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    cover_image_url: "",
    tags: [],
    published_at: new Date().toISOString().slice(0, 10),
    created_at: new Date().toISOString(),
    visible: true,
  });

  const onTitleChange = (title: string) => {
    if (!editing) return;
    setEditing((prev) => {
      if (!prev) return prev;
      const next = { ...prev, title };
      if (!slugTouched.current) next.slug = slugify(title);
      return next;
    });
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    const slug = (editing.slug || slugify(editing.title) || `post-${Date.now().toString(36)}`).trim();
    if (posts.some((p) => p.slug === slug && p.id !== editing.id)) {
      toast({ title: "That slug is already used by another post", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().savePost({
        ...editing,
        title: editing.title.trim(),
        slug,
        excerpt: editing.excerpt.trim(),
        tags: editing.tags.map((t) => t.trim()).filter(Boolean),
      });
      await refresh();
      setEditing(null);
      slugTouched.current = false;
      setPreview(false);
      toast({ title: "Post saved", description: editing.title });
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
      await getStore().deletePost(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Post deleted", description: deleting.title });
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

  const quickToggleVisible = async (post: BlogPost) => {
    try {
      await getStore().savePost({ ...post, visible: !post.visible });
      await refresh();
      toast({
        title: post.visible ? "Post hidden" : "Post published",
        description: post.title,
      });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  const openEditor = (post: BlogPost) => {
    slugTouched.current = Boolean(posts.some((p) => p.id === post.id));
    setPreview(false);
    setEditing({ ...post });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
            <PenLine className="h-5 w-5 text-mint" />
            Blog
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {posts.length} posts · {posts.filter((p) => p.visible !== false).length} live
          </p>
        </div>
        <Button
          onClick={() => {
            slugTouched.current = false;
            setPreview(false);
            setEditing(newPost());
          }}
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Post
        </Button>
      </div>

      {sorted.length === 0 ? (
        <div className="glass rounded-2xl px-8 py-12 text-center">
          <p className="font-display text-lg font-semibold text-starlight">No posts yet</p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            write about the new stuff you do — trips, projects, small wins
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((post, i) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass card-hover flex flex-wrap items-center gap-4 rounded-2xl p-4 ${
                post.visible === false ? "opacity-60" : ""
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display truncate text-sm font-semibold text-starlight">
                    {post.title || "(untitled)"}
                  </p>
                  {post.visible === false ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#ff5d7a]/30 bg-[#ff5d7a]/10 px-2 py-0.5 font-mono text-[9px] text-[#ff5d7a]">
                      <EyeOff className="h-2.5 w-2.5" /> hidden
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-mint/25 bg-mint/[0.07] px-2 py-0.5 font-mono text-[9px] text-mint">
                      <Eye className="h-2.5 w-2.5" /> live
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                  <CalendarDays className="mr-1 inline h-3 w-3" />
                  {formatDate(post.published_at)} · /blog/{post.slug}
                  {post.tags.length ? ` · ${post.tags.join(", ")}` : ""}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-mint"
                  onClick={() => quickToggleVisible(post)}
                  aria-label={post.visible === false ? "Publish post" : "Hide post"}
                  title={post.visible === false ? "Publish" : "Hide from site"}
                >
                  {post.visible === false ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-mint"
                  onClick={() => openEditor(post)}
                  aria-label={`Edit ${post.title}`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-muted-foreground hover:text-[#ff5d7a]"
                  onClick={() => setDeleting(post)}
                  aria-label={`Delete ${post.title}`}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* editor dialog */}
      <Dialog
        open={Boolean(editing)}
        onOpenChange={(v) => {
          if (!v) {
            setEditing(null);
            setPreview(false);
          }
        }}
      >
        <DialogContent className="glass-strong max-h-[92vh] overflow-y-auto border-indigo/25 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && posts.some((p) => p.id === editing.id) ? "Edit Post" : "New Post"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              markdown works — headings, lists, quotes, code, links, images
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">TITLE</Label>
                <Input
                  value={editing.title}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="border-indigo/25 bg-onyx/50"
                  placeholder="What I've been up to lately"
                  autoFocus
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-mint">
                    SLUG{" "}
                    <span className="text-muted-foreground">(site.com/#/blog/slug)</span>
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      value={editing.slug}
                      onChange={(e) => {
                        slugTouched.current = true;
                        setEditing({ ...editing, slug: slugify(e.target.value) });
                      }}
                      className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                      placeholder="auto-from-title"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="shrink-0 border-indigo/25"
                      onClick={() => setEditing({ ...editing, slug: slugify(editing.title) })}
                      aria-label="Regenerate slug from title"
                      title="Regenerate from title"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-mint">PUBLISH DATE</Label>
                  <Input
                    type="date"
                    value={editing.published_at}
                    onChange={(e) => setEditing({ ...editing, published_at: e.target.value })}
                    className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">SHORT SUMMARY</Label>
                <Textarea
                  value={editing.excerpt}
                  onChange={(e) => setEditing({ ...editing, excerpt: e.target.value })}
                  className="border-indigo/25 bg-onyx/50 text-sm"
                  placeholder="One or two lines shown on the post card…"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="font-mono text-xs text-mint">POST BODY</Label>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setPreview((v) => !v)}
                    className="h-6 border-indigo/25 px-2 font-mono text-[10px]"
                  >
                    <Eye className="mr-1 h-3 w-3" />
                    {preview ? "edit" : "preview"}
                  </Button>
                </div>
                {preview ? (
                  <div className="max-h-80 overflow-y-auto rounded-xl border border-indigo/20 bg-onyx/40 p-4">
                    <Markdown text={editing.content || "_(nothing to preview yet)_"} />
                  </div>
                ) : (
                  <>
                    <Textarea
                      value={editing.content}
                      onChange={(e) => setEditing({ ...editing, content: e.target.value })}
                      className="border-indigo/25 bg-onyx/50 font-mono text-[13px] leading-relaxed"
                      placeholder={"Write like you talk. Markdown tips:\n# big heading\n## smaller heading\n**bold**  *italic*  `code`\n- bullet point\n> a quote\n```js\nfenced code\n```"}
                      rows={12}
                    />
                    <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
                      # heading · ## subheading · **bold** · *italic* · `code` · - list · &gt; quote ·
                      [link](url) · ![image](url)
                    </p>
                  </>
                )}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-mint">TAGS (comma separated)</Label>
                  <Input
                    value={editing.tags.join(", ")}
                    onChange={(e) =>
                      setEditing({ ...editing, tags: e.target.value.split(",").map((t) => t.trimStart()) })
                    }
                    className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                    placeholder="photography, weekend, notes"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="font-mono text-xs text-mint">COVER IMAGE URL</Label>
                  <Input
                    value={editing.cover_image_url}
                    onChange={(e) => setEditing({ ...editing, cover_image_url: e.target.value })}
                    className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                    placeholder="optional — R2 URL or any public image"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between rounded-xl border border-indigo/15 bg-white/[0.02] px-4 py-3">
                <div>
                  <p className="font-display text-sm font-semibold text-starlight">Visible on site</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    hidden posts stay saved but don&apos;t show up
                  </p>
                </div>
                <Switch
                  checked={editing.visible !== false}
                  onCheckedChange={(v) => setEditing({ ...editing, visible: v })}
                  aria-label="Toggle post visibility"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setEditing(null);
                    setPreview(false);
                  }}
                  className="font-mono text-xs"
                >
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save post
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
            <AlertDialogTitle className="font-display text-starlight">Delete post?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              “{deleting?.title}” will be gone for good.
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
