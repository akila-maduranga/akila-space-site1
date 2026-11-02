"use client";

import { Fragment, type ReactNode } from "react";

/**
 * A small, dependency-free markdown-ish renderer for blog posts.
 * Supports: #/##/### headings, paragraphs, **bold**, *italic*,
 * `inline code`, [links](url), ![images](url), - / * bullets,
 * 1. numbered lists, > blockquotes, ``` fenced code and --- rules.
 * Everything renders as safe React elements — no HTML injection.
 */

// ── inline parsing ────────────────────────────────────────────

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(`[^`]+`)|(!\[[^\]]*\]\([^)]+\))|(\[[^\]]+\]\([^)]+\))|(\*\*[^*]+\*\*)|(\*[^*]+\*)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(<Fragment key={`${keyPrefix}-t${i++}`}>{text.slice(last, match.index)}</Fragment>);
    }
    const token = match[0];
    const key = `${keyPrefix}-m${i++}`;

    if (token.startsWith("`")) {
      nodes.push(
        <code
          key={key}
          className="rounded-md border border-indigo/25 bg-indigo/10 px-1.5 py-0.5 font-mono text-[0.85em] text-mint"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else if (token.startsWith("![")) {
      const alt = token.slice(2, token.indexOf("]"));
      const url = token.slice(token.indexOf("](") + 2, -1);
      nodes.push(
        <img
          key={key}
          src={url}
          alt={alt}
          className="my-4 w-full rounded-xl border border-indigo/20 shadow-[0_20px_60px_-24px_rgba(99,49,251,0.5)]"
          loading="lazy"
        />
      );
    } else if (token.startsWith("[")) {
      const label = token.slice(1, token.indexOf("]"));
      const url = token.slice(token.indexOf("](") + 2, -1);
      nodes.push(
        <a
          key={key}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-mint underline decoration-mint/40 underline-offset-4 transition-colors hover:decoration-mint"
        >
          {label}
        </a>
      );
    } else if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-starlight">
          {token.slice(2, -2)}
        </strong>
      );
    } else {
      nodes.push(
        <em key={key} className="italic text-starlight/90">
          {token.slice(1, -1)}
        </em>
      );
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    nodes.push(<Fragment key={`${keyPrefix}-t${i++}`}>{text.slice(last)}</Fragment>);
  }
  return nodes;
}

// ── block parsing ─────────────────────────────────────────────

export function Markdown({ text }: { text: string }) {
  const lines = (text || "").replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let bi = 0;

  const flushParagraph = (buffer: string[]) => {
    if (!buffer.length) return;
    blocks.push(
      <p key={`p-${bi++}`} className="mb-5 leading-[1.85] text-muted-foreground sm:text-[15px]">
        {renderInline(buffer.join(" "), `p${bi}`)}
      </p>
    );
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // blank line
    if (!trimmed) {
      i++;
      continue;
    }

    // fenced code block
    if (trimmed.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++; // closing fence
      blocks.push(
        <div key={`code-${bi++}`} className="mb-6 overflow-hidden rounded-xl border border-indigo/25 bg-[#07070f]/90">
          <div className="flex items-center gap-1.5 border-b border-indigo/15 px-4 py-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/70" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/70" />
            <span className="ml-2 font-mono text-[10px] tracking-widest text-muted-foreground/60">snip</span>
          </div>
          <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-mint/90">
            <code>{code.join("\n")}</code>
          </pre>
        </div>
      );
      continue;
    }

    // headings
    const heading = /^(#{1,3})\s+(.*)$/.exec(trimmed);
    if (heading) {
      const level = heading[1].length;
      const content = renderInline(heading[2], `h${bi}`);
      if (level === 1) {
        blocks.push(
          <h2 key={`h-${bi++}`} className="mb-4 mt-8 font-display text-2xl font-bold text-starlight sm:text-3xl">
            {content}
          </h2>
        );
      } else if (level === 2) {
        blocks.push(
          <h3
            key={`h-${bi++}`}
            className="mb-3 mt-7 flex items-baseline gap-3 font-display text-xl font-bold text-starlight sm:text-2xl"
          >
            <span className="font-mono text-sm text-mint">{"//"}</span>
            {content}
          </h3>
        );
      } else {
        blocks.push(
          <h4 key={`h-${bi++}`} className="mb-3 mt-6 font-display text-lg font-semibold text-starlight">
            {content}
          </h4>
        );
      }
      i++;
      continue;
    }

    // horizontal rule
    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      blocks.push(
        <hr key={`hr-${bi++}`} className="my-8 border-0 h-px bg-gradient-to-r from-transparent via-indigo/40 to-transparent" />
      );
      i++;
      continue;
    }

    // blockquote
    if (trimmed.startsWith(">")) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith(">")) {
        quote.push(lines[i].trim().replace(/^>\s?/, ""));
        i++;
      }
      blocks.push(
        <blockquote
          key={`q-${bi++}`}
          className="mb-6 rounded-r-xl border-l-2 border-mint/60 bg-mint/[0.05] py-3 pl-5 pr-4 italic text-starlight/80"
        >
          {renderInline(quote.join(" "), `q${bi}`)}
        </blockquote>
      );
      continue;
    }

    // bullet list
    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ""));
        i++;
      }
      blocks.push(
        <ul key={`ul-${bi++}`} className="mb-6 space-y-2.5 pl-1">
          {items.map((item, li) => (
            <li key={li} className="flex gap-3 leading-[1.75] text-muted-foreground sm:text-[15px]">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-mint shadow-[0_0_8px_rgba(136,249,192,0.6)]" />
              <span>{renderInline(item, `ul${bi}-${li}`)}</span>
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // numbered list
    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ""));
        i++;
      }
      blocks.push(
        <ol key={`ol-${bi++}`} className="mb-6 space-y-2.5 pl-1">
          {items.map((item, li) => (
            <li key={li} className="flex gap-3 leading-[1.75] text-muted-foreground sm:text-[15px]">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md border border-indigo/30 bg-indigo/10 font-mono text-[11px] text-indigo-soft">
                {li + 1}
              </span>
              <span>{renderInline(item, `ol${bi}-${li}`)}</span>
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // paragraph — accumulate until blank / special line
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|[-*]\s|\d+\.\s|>|```|-{3,})/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim());
      i++;
    }
    flushParagraph(para);
  }

  return <div className="markdown-body">{blocks}</div>;
}
