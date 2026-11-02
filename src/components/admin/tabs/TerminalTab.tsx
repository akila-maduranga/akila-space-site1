"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { EyeOff, Pencil, Plus, SquareTerminal, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import type { TerminalLine } from "@/lib/types";

const COLORS = [
  { key: "mint", label: "mint", cls: "text-mint" },
  { key: "starlight", label: "starlight", cls: "text-starlight/90" },
  { key: "indigo", label: "indigo", cls: "text-indigo-soft" },
] as const;

const PLACEHOLDERS = [
  { token: "{{photos}}", hint: "photo count" },
  { token: "{{projects}}", hint: "project count" },
  { token: "{{posts}}", hint: "blog post count" },
  { token: "{{years}}", hint: "years of experience" },
  { token: "{{name}}", hint: "your name" },
];

/**
 * Edits the hero terminal window ("akila@cosmos: ~/portfolio") —
 * every command and its output. The window title itself lives in
 * Profile → "terminal window title".
 */
export default function TerminalTab() {
  const { terminalLines, refresh } = useSite();
  const { toast } = useToast();
  const [editing, setEditing] = useState<TerminalLine | null>(null);
  const [deleting, setDeleting] = useState<TerminalLine | null>(null);
  const [busy, setBusy] = useState(false);

  const save = async () => {
    if (!editing) return;
    if (!editing.command.trim()) {
      toast({ title: "Command required", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      await getStore().saveTerminalLine({
        ...editing,
        command: editing.command.trim().replace(/^\$\s*/, ""),
        output: editing.output,
        color: COLORS.some((c) => c.key === editing.color) ? editing.color : "starlight",
        sort_order: Number(editing.sort_order) || 0,
      });
      await refresh();
      setEditing(null);
      toast({ title: "Terminal line saved", description: `$ ${editing.command}` });
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
      await getStore().deleteTerminalLine(deleting.id);
      await refresh();
      setDeleting(null);
      toast({ title: "Terminal line removed", description: `$ ${deleting.command}` });
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

  const colorCls = (key: string) => COLORS.find((c) => c.key === key)?.cls || "text-starlight/90";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
            <SquareTerminal className="h-5 w-5 text-mint" />
            Terminal
          </h2>
          <p className="font-mono text-xs text-muted-foreground">
            {terminalLines.length} commands in the hero terminal window · title comes from Profile
          </p>
        </div>
        <Button
          onClick={() =>
            setEditing({
              id: `term-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
              command: "",
              output: "",
              color: "starlight",
              sort_order: terminalLines.length,
              visible: true,
            })
          }
          className="bg-gradient-to-r from-indigo to-indigo/70 font-display font-semibold shadow-[0_10px_30px_-8px_rgba(99,49,251,0.7)]"
        >
          <Plus className="h-4 w-4" />
          New Command
        </Button>
      </div>

      {/* live preview of the whole window */}
      <div className="glass glow-border overflow-hidden rounded-2xl">
        <div className="flex items-center gap-2 border-b border-indigo/15 bg-white/[0.02] px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
          <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
          <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          <span className="ml-3 font-mono text-xs text-muted-foreground">hero terminal preview</span>
        </div>
        <div className="p-5 font-mono text-[13px] leading-6">
          {terminalLines.length === 0 ? (
            <p className="text-muted-foreground">no commands yet — add one above</p>
          ) : (
            terminalLines.map((line) => (
              <div key={line.id} className={`mb-2 last:mb-0 ${line.visible === false ? "opacity-40" : ""}`}>
                <p className="text-mint">
                  $ {line.command}
                  {line.visible === false ? (
                    <EyeOff className="ml-2 inline h-3 w-3 text-[#ff5d7a]" aria-label="hidden" />
                  ) : null}
                </p>
                {line.output ? <p className={colorCls(line.color)}>{line.output}</p> : null}
              </div>
            ))
          )}
        </div>
      </div>

      {/* editor rows */}
      <div className="glass glow-border rounded-2xl p-5">
        <div className="grid gap-3 md:grid-cols-2">
          {terminalLines.map((line) => (
            <motion.div
              key={line.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass card-hover rounded-xl p-3 font-mono text-xs ${
                line.visible === false ? "opacity-60" : ""
              }`}
            >
              <p className="text-mint">$ {line.command}</p>
              {line.output ? <p className={`mt-1 truncate ${colorCls(line.color)}`}>{line.output}</p> : null}
              <div className="mt-2.5 flex items-center justify-between">
                <span className="text-[10px] text-muted-foreground">#{line.sort_order}</span>
                <div className="flex items-center gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-mint"
                    onClick={() => setEditing({ ...line })}
                    aria-label={`Edit ${line.command}`}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-7 w-7 text-muted-foreground hover:text-[#ff5d7a]"
                    onClick={() => setDeleting(line)}
                    aria-label={`Delete ${line.command}`}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        <DialogContent className="glass-strong max-w-md border-indigo/25">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-starlight">
              {editing && terminalLines.some((l) => l.id === editing.id) ? "Edit Command" : "New Command"}
            </DialogTitle>
            <DialogDescription className="font-mono text-xs">
              a line in the hero terminal window
            </DialogDescription>
          </DialogHeader>

          {editing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">
                  COMMAND <span className="text-muted-foreground">(shown with a “$” prompt)</span>
                </Label>
                <Input
                  value={editing.command}
                  onChange={(e) => setEditing({ ...editing, command: e.target.value })}
                  className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                  placeholder="whoami"
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">
                  OUTPUT <span className="text-muted-foreground">(leave empty for none)</span>
                </Label>
                <Textarea
                  value={editing.output}
                  onChange={(e) => setEditing({ ...editing, output: e.target.value })}
                  rows={2}
                  className="border-indigo/25 bg-onyx/50 font-mono text-sm"
                  placeholder="enthusiast · tinkerer · guy with a camera"
                />
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-mono text-[10px] text-muted-foreground">insert:</span>
                  {PLACEHOLDERS.map((p) => (
                    <button
                      key={p.token}
                      type="button"
                      title={p.hint}
                      onClick={() =>
                        setEditing({ ...editing, output: `${editing.output}{{${p.token.replace(/[{}]/g, "")}}}` })
                      }
                      className="rounded-md border border-indigo/25 bg-indigo/10 px-1.5 py-0.5 font-mono text-[10px] text-mint transition-colors hover:bg-indigo/20"
                    >
                      {p.token}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="font-mono text-xs text-mint">OUTPUT COLOUR</Label>
                <div className="grid grid-cols-3 gap-1.5">
                  {COLORS.map((c) => {
                    const selected = editing.color === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        aria-pressed={selected}
                        onClick={() => setEditing({ ...editing, color: c.key })}
                        className={`rounded-lg border px-3 py-2 font-mono text-xs transition-all ${
                          selected
                            ? "border-mint/50 bg-mint/10 text-mint"
                            : "border-indigo/20 text-muted-foreground hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className={selected ? "" : c.cls}>{c.label}</span>
                      </button>
                    );
                  })}
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
                  aria-label="Toggle terminal line visibility"
                />
              </div>

              <div className="rounded-xl border border-indigo/20 bg-white/[0.02] p-3 font-mono text-[13px] leading-6">
                <p className="text-mint">$ {editing.command || "…"}</p>
                {editing.output ? <p className={colorCls(editing.color)}>{editing.output}</p> : null}
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditing(null)} className="font-mono text-xs">
                  cancel
                </Button>
                <Button onClick={save} disabled={busy} className="font-mono text-xs">
                  save command
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(v) => !v && setDeleting(null)}>
        <AlertDialogContent className="glass-strong border-indigo/25">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display text-starlight">Remove command?</AlertDialogTitle>
            <AlertDialogDescription className="font-mono text-xs">
              Delete “$ {deleting?.command}” from the terminal window?
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
