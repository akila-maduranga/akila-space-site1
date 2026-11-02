"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDown, ArrowUp, Eye, EyeOff, LayoutList, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useSite } from "@/lib/site-context";
import { getStore } from "@/lib/store";
import type { PageSection } from "@/lib/types";

export default function PagesTab() {
  const { pages, refresh } = useSite();
  const { toast } = useToast();
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...pages].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)),
    [pages]
  );

  const persist = async (page: PageSection, next: Partial<PageSection>, message: string) => {
    setBusyKey(page.key);
    try {
      await getStore().savePage({ ...page, ...next });
      await refresh();
      toast({ title: message, description: page.label });
    } catch (err) {
      toast({
        title: "Update failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusyKey(null);
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= sorted.length) return;
    const a = sorted[index];
    const b = sorted[target];
    setBusyKey(a.key);
    try {
      await getStore().savePage({ ...a, sort_order: b.sort_order });
      await getStore().savePage({ ...b, sort_order: a.sort_order });
      await refresh();
    } catch (err) {
      toast({
        title: "Reorder failed",
        description: err instanceof Error ? err.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display flex items-center gap-2 text-xl font-bold text-starlight">
          <LayoutList className="h-5 w-5 text-mint" />
          Pages & Sections
        </h2>
        <p className="mt-1 max-w-xl font-mono text-xs leading-relaxed text-muted-foreground">
          flip a section off and it disappears from the site — nav, numbering and all. reorder
          changes how the home page flows. the hero at the top always stays.
        </p>
      </div>

      <div className="space-y-3">
        {/* hero — always on */}
        <div className="glass flex items-center gap-4 rounded-2xl border-indigo/15 p-4 opacity-80">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-indigo/20 bg-white/[0.04] font-mono text-xs text-indigo-soft">
            00
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-sm font-semibold text-starlight">Home / Hero</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              name, intro & social icons — the front door, always on
            </p>
          </div>
          <span className="rounded-full border border-indigo/20 bg-indigo/[0.08] px-2.5 py-1 font-mono text-[9px] text-indigo-soft">
            permanent
          </span>
        </div>

        {sorted.map((page, i) => {
          const busy = busyKey === page.key;
          const visible = page.visible !== false;
          return (
            <motion.div
              key={page.key}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={`glass card-hover flex flex-wrap items-center gap-4 rounded-2xl p-4 ${
                visible ? "" : "opacity-60"
              }`}
            >
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-indigo/20 bg-white/[0.04] font-mono text-xs text-indigo-soft">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-sm font-semibold text-starlight">{page.label}</p>
                  <code className="rounded border border-indigo/20 bg-indigo/[0.08] px-1.5 py-0.5 font-mono text-[10px] text-indigo-soft">
                    #{page.key}
                  </code>
                  {visible ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-mint/25 bg-mint/[0.07] px-2 py-0.5 font-mono text-[9px] text-mint">
                      <Eye className="h-2.5 w-2.5" /> live
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-[#ff5d7a]/30 bg-[#ff5d7a]/10 px-2 py-0.5 font-mono text-[9px] text-[#ff5d7a]">
                      <EyeOff className="h-2.5 w-2.5" /> hidden
                    </span>
                  )}
                </div>
                <p className="mt-1 truncate font-mono text-[10px] text-muted-foreground">
                  {page.description || "no description set"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <div className="flex flex-col gap-0.5">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-mint disabled:opacity-30"
                    onClick={() => move(i, -1)}
                    disabled={i === 0 || busy}
                    aria-label={`Move ${page.label} up`}
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 text-muted-foreground hover:text-mint disabled:opacity-30"
                    onClick={() => move(i, 1)}
                    disabled={i === sorted.length - 1 || busy}
                    aria-label={`Move ${page.label} down`}
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
                <Switch
                  checked={visible}
                  disabled={busy}
                  onCheckedChange={(v) =>
                    persist(page, { visible: v }, v ? "Section is live" : "Section hidden")
                  }
                  aria-label={`Toggle ${page.label} visibility`}
                />
                {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin text-mint" /> : null}
              </div>
            </motion.div>
          );
        })}
      </div>

      <p className="font-mono text-[10px] leading-relaxed text-muted-foreground">
        heads up: hiding a section also removes it from the navigation bar, and the numbering of the
        remaining sections shifts up automatically.
      </p>
    </div>
  );
}
