import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { GitHubLoginButton } from "@/components/GitHubLoginButton";

const FOOTER_LINKS = [
  { href: "/what-is-wakeup-dev", label: "What is WakeUp Dev" },
  { href: "/webhook-to-phone-call", label: "How it works" },
  { href: "/faq", label: "FAQ" },
] as const;

export function MarketingNav() {
  return (
    <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between border-b border-zinc-800/80 px-4 py-5 sm:px-6">
      <BrandLogo href="/" />
      <div className="flex items-center gap-4">
        {FOOTER_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="hidden text-sm text-zinc-400 transition hover:text-zinc-50 sm:inline"
          >
            {link.label}
          </Link>
        ))}
        <GitHubLoginButton
          className="h-9 rounded-md px-3 py-0 text-xs sm:text-sm"
          label="Sign in"
        />
      </div>
    </nav>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative z-10 border-t border-zinc-800 py-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <BrandLogo href="/" className="w-fit" />
          <p className="mt-3 max-w-sm text-xs leading-relaxed text-zinc-500">
            WakeUp Dev — pay per alert, not per seat.
          </p>
        </div>
        <ul className="flex flex-col gap-2 text-sm text-zinc-400">
          {FOOTER_LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition hover:text-zinc-50">
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <p className="mx-auto mt-8 max-w-6xl px-4 text-center text-xs text-zinc-600 sm:px-6">
        © {new Date().getFullYear()} WakeUp Dev
      </p>
    </footer>
  );
}

export function MarketingShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-50">
      <div className="pointer-events-none absolute inset-0 grid-noise opacity-30" />
      <MarketingNav />
      <div className="relative z-10">{children}</div>
      <MarketingFooter />
    </div>
  );
}
