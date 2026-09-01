import Link from "next/link";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";
import { caseStudySeniorSafe } from "@/lib/blog/posts";

function TerminalBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto bg-slate-900 p-4 font-mono text-sm leading-relaxed text-slate-100 rounded-xl">
      <code>{children}</code>
    </pre>
  );
}

export function BlogCaseStudySeniorSafeArticle() {
  const meta = caseStudySeniorSafe;

  return (
    <article className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="border-b border-zinc-800 pb-10">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
          Blog · Case study
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl">
          {meta.title}
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-zinc-300">
          {meta.description}
        </p>
        <p className="mt-4 text-sm text-zinc-500">
          <time dateTime={meta.dateIso}>{meta.dateLabel}</time>
          <span className="text-zinc-700"> · </span>
          <span>{meta.author}</span>
        </p>
      </header>

      <section className="mt-12" aria-labelledby="problem">
        <h2 id="problem" className="text-2xl font-semibold text-zinc-50">
          The routing problem is the same as SRE paging
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Senior Safe is a Chilean teleassistance product: a domestic SOS must
          reach a human guardian in seconds. That is the same class of problem
          SRE teams face when Grafana or UptimeRobot fires — except the blast
          radius is a household, not a cluster. Push and email are easy to miss.
          A phone call is harder to ignore, but a naive dialer creates a worse
          failure mode:{" "}
          <strong className="font-medium text-zinc-300">
            voicemail false positives
          </strong>
          . The machine answers. The cascade stops. Nobody actually heard the
          alert.
        </p>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          WakeUp Dev is the shared voice engine. Senior Safe consumes it for
          family emergencies. DevOps teams consume the same Worker for{" "}
          <Link
            href="/on-call-escalation"
            className="text-accent underline-offset-2 hover:underline"
          >
            SRE emergency routing
          </Link>
          . One on-call cascade, two products, zero per-seat tax.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="edge">
        <h2 id="edge" className="text-2xl font-semibold text-zinc-50">
          Edge compute: Cloudflare Workers voice alerts without cold starts
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Domestic emergencies do not wait for a container to boot. The public
          ingest lives on{" "}
          <strong className="font-medium text-zinc-300">
            Cloudflare Workers
          </strong>{" "}
          at{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-sm text-zinc-200">
            api.wakeupdev.com
          </code>
          . Isolates are already warm at the edge. There is no Lambda-style cold
          start on the first 3 a.m. page. Auth is an{" "}
          <code className="rounded bg-zinc-900 px-1.5 py-0.5 font-mono text-sm text-zinc-200">
            x-api-key
          </code>{" "}
          header; the body is raw text or JSON (capped at 4,000 characters).
          Credits are consumed atomically in Postgres before the cascade is
          scheduled — a 202 means a credit is gone and a call is in flight.
        </p>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          That contract is what Senior Safe and a Grafana contact point both
          speak. See{" "}
          <Link
            href="/webhook-to-phone-call"
            className="text-accent underline-offset-2 hover:underline"
          >
            webhook to phone call
          </Link>{" "}
          and the{" "}
          <a
            href="https://github.com/enriquecasadesign1957/wakeup-dev-integrations"
            className="text-accent underline-offset-2 hover:underline"
          >
            integration toolbox
          </a>
          .
        </p>
        <div className="mt-6">
          <TerminalBlock>
            {`curl -X POST https://api.wakeupdev.com/v1/alert \\
  -H "x-api-key: wk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{"message":"Senior Safe SOS — guardian cascade","severity":"critical"}'

# HTTP 202
# {"accepted":true,"estado":"TRIGGERED","creditos_restantes":4}`}
          </TerminalBlock>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="ack">
        <h2 id="ack" className="text-2xl font-semibold text-zinc-50">
          Voicemail false positive mitigation: ACK is a digit, not a pickup
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Answering machine detection is a hint, not a source of truth. WakeUp
          Dev treats human acknowledgement as a{" "}
          <strong className="font-medium text-zinc-300">Twilio Gather</strong>{" "}
          on digit <span className="font-mono text-zinc-200">1</span>. If the
          callee does not confirm, the Worker does not mark the incident
          acknowledged. The cascade continues: next guardian, next on-call,
          next attempt. That is the difference between “the carrier connected
          audio” and “a human heard the alert.”
        </p>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          For Senior Safe, the first hop is a family member. For a DevOps
          squad, it is whoever is on shift. Same TwiML bridge. Same
          voicemail-resistant policy. AMD can stay off; the ACK digit still
          holds the line.
        </p>
        <div className="mt-6">
          <TerminalBlock>
            {`# Conceptual TwiML (Gather + cascade)
<Response>
  <Gather numDigits="1" action="/v1/twilio/ivr-callback">
    <Say language="es-MX">Alerta WakeUp Dev. Presione 1 para confirmar.</Say>
  </Gather>
</Response>
# No digit → status callback → next target in on-call order`}
          </TerminalBlock>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="cascade">
        <h2 id="cascade" className="text-2xl font-semibold text-zinc-50">
          Zero-cold-start cascades
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          After ingest, the Worker does not wait on Groq to accept the alert.
          HTTP 202 returns immediately. Voice copy is filled asynchronously;
          Twilio dials from the edge callback origin. Escalation is ordered
          roster, then weekly shifts, then the account’s verified E.164
          fallback. Each hop is another Worker invocation — still no cold
          start — until ACK or exhaustion.
        </p>
        <p className="mt-4 text-base leading-relaxed text-zinc-400">
          Credits are FIFO against gift lots when a promo applies, then paid
          balance. The guardian does not see billing. The SRE does not see a
          per-seat invoice for adding a fourth engineer. That is the commercial
          contract Senior Safe needed for households and WakeUp Dev needed for
          squads:{" "}
          <Link href="/#precios" className="text-accent underline-offset-2 hover:underline">
            pay per dispatched call
          </Link>
          , unlimited humans on the graph.
        </p>
      </section>

      <section className="mt-12" aria-labelledby="lessons">
        <h2 id="lessons" className="text-2xl font-semibold text-zinc-50">
          What this architecture taught us
        </h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-zinc-400">
          <li>
            Treat voicemail as a failed hop. Pickup is not ACK.
          </li>
          <li>
            Keep ingest on isolates with no boot penalty — Cloudflare Workers
            voice alerts stay in the millisecond path.
          </li>
          <li>
            Deduct credit before dial. 202 is a promise you already paid for.
          </li>
          <li>
            One cascade engine can serve teleassistance and SRE emergency
            routing if the contract is HTTP + a human digit.
          </li>
        </ul>
      </section>

      <section
        className="mt-14 rounded-2xl border border-accent/30 bg-accent/5 p-6 sm:p-8"
        aria-labelledby="discussion"
      >
        <h2 id="discussion" className="text-xl font-semibold text-zinc-50">
          💬 SRE &amp; DevOps Insights
        </h2>
        <p className="mt-4 text-base leading-relaxed text-zinc-300">
          What are your thoughts on edge-based escalation handlers? How do you
          manage voicemail false positives in your current infrastructure
          shifts? This blog is open to architectural debates and feedback!
        </p>
        <p className="mt-3 text-sm text-zinc-500">
          Write to{" "}
          <a
            href="mailto:administrador@wakeupdev.com?subject=WakeUp%20Dev%20blog%20%E2%80%94%20edge%20escalation"
            className="text-accent underline-offset-2 hover:underline"
          >
            administrador@wakeupdev.com
          </a>{" "}
          or continue from{" "}
          <Link href="/faq" className="text-accent underline-offset-2 hover:underline">
            the FAQ
          </Link>
          .
        </p>
      </section>

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
