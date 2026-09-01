import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import type { BlogBlock, GeneratedPost } from "@/lib/blog/types";

function TerminalBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100 rounded-xl">
      <code>{children}</code>
    </pre>
  );
}

function Block({ block, index }: { block: BlogBlock; index: number }) {
  switch (block.type) {
    case "h2": {
      const id = `s-${index}`;
      return (
        <h2 id={id} className="mt-12 text-2xl font-semibold text-zinc-50">
          {block.text}
        </h2>
      );
    }
    case "h3":
      return (
        <h3 className="mt-8 text-xl font-semibold text-zinc-100">
          {block.text}
        </h3>
      );
    case "p":
      return (
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          {block.text}
        </p>
      );
    case "ul":
      return (
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-400">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "code":
      return (
        <div className="mt-6">
          <TerminalBlock>{block.code}</TerminalBlock>
        </div>
      );
    case "discussion":
      return (
        <section
          className="mt-14 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8"
          aria-labelledby="discussion"
        >
          <h2 id="discussion" className="text-xl font-semibold text-zinc-50">
            💬 SRE &amp; DevOps Insights
          </h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">
            {block.text}
          </p>
          <p className="mt-3 text-sm text-zinc-500">
            Write to{" "}
            <a
              href="mailto:administrador@wakeupdev.com?subject=WakeUp%20Dev%20blog"
              className="text-accent underline-offset-2 hover:underline"
            >
              administrador@wakeupdev.com
            </a>{" "}
            or continue from{" "}
            <Link
              href="/faq"
              className="text-accent underline-offset-2 hover:underline"
            >
              the FAQ
            </Link>
            .
          </p>
        </section>
      );
    default:
      return null;
  }
}

export function BlogGeneratedArticle({ post }: { post: GeneratedPost }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="border-b border-zinc-800 pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Blog · Engineering
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          {post.title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-300">
          {post.description}
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          <time dateTime={post.dateIso}>{post.dateLabel}</time>
          <span className="text-zinc-700"> · </span>
          <span>{post.author}</span>
        </p>
      </header>

      <div>
        {post.blocks.map((block, index) => (
          <Block key={`${block.type}-${index}`} block={block} index={index} />
        ))}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <GitHubLoginButton label="Start free — 5 voice alerts" />
        <Link
          href="/blog"
          className="inline-flex h-12 items-center rounded-md border border-zinc-800 bg-zinc-950 px-5 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50"
        >
          All posts
        </Link>
      </div>
    </article>
  );
}
