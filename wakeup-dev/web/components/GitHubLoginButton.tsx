import { Github } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
  label?: string;
};

export function GitHubLoginButton({
  className,
  label = "Iniciar Sesión con GitHub",
}: Props) {
  return (
    <Link
      href="/auth/github"
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-sm font-semibold text-black transition hover:bg-accent-dim",
        className
      )}
    >
      <Github className="h-4 w-4" />
      {label}
    </Link>
  );
}
