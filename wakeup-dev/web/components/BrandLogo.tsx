import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const SYMBOL_SRC = "/logo-wakeupdev-symbol-transparent.png";

type BrandLogoProps = {
  href?: string;
  className?: string;
  symbolClassName?: string;
  showWordmark?: boolean;
};

export function BrandLogo({
  href = "/",
  className,
  symbolClassName,
  showWordmark = true,
}: BrandLogoProps) {
  const content = (
    <>
      <Image
        src={SYMBOL_SRC}
        alt="WakeUp Dev"
        width={32}
        height={32}
        className={cn("h-8 w-8 shrink-0 object-contain", symbolClassName)}
        priority
      />
      {showWordmark ? (
        <span className="text-[15px] font-semibold tracking-tight text-zinc-50">
          WakeUp<span className="text-accent"> Dev</span>
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn("flex items-center gap-2.5", className)}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center gap-2.5", className)}>{content}</div>
  );
}
