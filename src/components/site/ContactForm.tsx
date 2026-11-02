"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Send, TriangleAlert } from "lucide-react";
import type { Profile } from "@/lib/types";

type Status = "idle" | "sending" | "sent" | "error";

/** Contact form for the /connect page — posts to /api/contact
 *  (Resend) and falls back to a plain mailto: link when email
 *  isn't configured on the deployment. */
export default function ContactForm({ profile }: { profile: Profile }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [configured, setConfigured] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status === "sending") return;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setStatus("sent");
        setForm({ name: "", email: "", subject: "", message: "", website: "" });
        return;
      }
      if (res.status === 503 || data.configured === false) setConfigured(false);
      setError(data.error || "Something went wrong — please try again.");
      setStatus("error");
    } catch {
      setError("Network hiccup — please try again.");
      setStatus("error");
    }
  };

  const inputCls =
    "w-full rounded-xl border border-indigo/20 bg-white/[0.04] px-4 py-3 text-sm text-starlight placeholder:text-muted-foreground/60 outline-none transition-all duration-300 focus:border-mint/50 focus:bg-white/[0.06] focus:shadow-[0_0_24px_rgba(136,249,192,0.12)]";

  if (status === "sent") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass rounded-2xl p-6 text-left"
      >
        <CheckCircle2 className="h-8 w-8 text-mint" aria-hidden />
        <p className="font-display mt-3 text-lg font-semibold text-starlight">
          Message launched into orbit
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Thanks for writing — it just landed in my inbox. I usually reply within
          a day or two.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-4 font-mono text-xs text-mint underline-offset-4 hover:underline"
        >
          ▸ send another
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="glass space-y-4 rounded-2xl p-6 text-left" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] tracking-wide text-muted-foreground">
            name <span className="text-mint">*</span>
          </span>
          <input
            type="text"
            value={form.name}
            onChange={set("name")}
            required
            maxLength={100}
            placeholder="your name"
            className={inputCls}
            autoComplete="name"
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block font-mono text-[11px] tracking-wide text-muted-foreground">
            email <span className="text-mint">*</span>
          </span>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            required
            maxLength={200}
            placeholder="you@example.com"
            className={inputCls}
            autoComplete="email"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block font-mono text-[11px] tracking-wide text-muted-foreground">
          subject
        </span>
        <input
          type="text"
          value={form.subject}
          onChange={set("subject")}
          maxLength={150}
          placeholder="what's this about?"
          className={inputCls}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block font-mono text-[11px] tracking-wide text-muted-foreground">
          message <span className="text-mint">*</span>
        </span>
        <textarea
          value={form.message}
          onChange={set("message")}
          required
          maxLength={5000}
          rows={4}
          placeholder="cameras, code, collabs, or the best short-eats spot on the island…"
          className={`${inputCls} resize-none`}
        />
      </label>

      {/* honeypot — invisible to humans, catnip for bots */}
      <input
        type="text"
        value={form.website}
        onChange={set("website")}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="pointer-events-none absolute h-0 w-0 opacity-0"
        style={{ position: "absolute", left: "-9999px" }}
      />

      {status === "error" && (
        <p className="flex items-start gap-2 rounded-xl border border-red-400/30 bg-red-400/[0.06] px-4 py-3 text-xs leading-relaxed text-red-300">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            {error}
            {!configured && (
              <>
                {" "}
                <a
                  href={`mailto:${profile.email}`}
                  className="text-mint underline-offset-2 hover:underline"
                >
                  Email me directly
                </a>{" "}
                instead.
              </>
            )}
          </span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="submit"
          disabled={status === "sending"}
          className="mint-glow-btn group inline-flex items-center gap-2.5 rounded-full bg-gradient-to-r from-indigo to-indigo/70 px-6 py-3 font-display text-sm font-semibold text-white shadow-[0_10px_40px_-10px_rgba(99,49,251,0.8)] transition-opacity disabled:opacity-60"
        >
          {status === "sending" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5" aria-hidden />
          )}
          {status === "sending" ? "transmitting…" : "Send message"}
        </button>
        <a
          href={`mailto:${profile.email}`}
          className="font-mono text-[11px] text-muted-foreground transition-colors hover:text-mint"
        >
          or email {profile.email}
        </a>
      </div>
    </form>
  );
}
