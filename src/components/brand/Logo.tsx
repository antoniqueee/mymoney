import Image from "next/image";
import Link from "next/link";

import { brandConfig } from "@/config/brand";
import { cn } from "@/lib/utils";

const logoSizes = {
  sm: 28,
  md: 36,
  lg: 48,
  xl: 64,
} as const;

export interface LogoProps {
  source?: string;
  alt?: string;
  size?: keyof typeof logoSizes | number;
  variant?: "default" | "compact" | "inverse";
  wordmark?: boolean;
  className?: string;
  priority?: boolean;
}

function Logo({
  source = brandConfig.logo.source,
  alt = brandConfig.logo.alt,
  size = "md",
  variant = "default",
  wordmark = true,
  className,
  priority = false,
}: LogoProps) {
  const pixels = typeof size === "number" ? size : logoSizes[size];

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2.5",
        variant === "compact" && "gap-2",
        variant === "inverse" ? "text-inverse" : "text-navy",
        className,
      )}
    >
      <span
        className="relative block shrink-0"
        style={{ width: pixels, height: pixels }}
      >
        <Image
          src={source}
          alt={alt}
          fill
          priority={priority}
          sizes={`${pixels}px`}
          className="object-contain"
        />
      </span>
      {wordmark ? (
        <span
          className={cn(
            "font-brand font-semibold leading-none tracking-[-0.025em]",
            pixels <= logoSizes.sm ? "text-lg" : pixels >= logoSizes.lg ? "text-2xl" : "text-xl",
          )}
        >
          {brandConfig.name}
        </span>
      ) : null}
    </span>
  );
}

export interface LogoLinkProps extends LogoProps {
  href?: string;
  linkClassName?: string;
}

function LogoLink({ href = brandConfig.links.home, linkClassName, ...props }: LogoLinkProps) {
  return (
    <Link
      href={href}
      className={cn("inline-flex rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", linkClassName)}
      aria-label={`${brandConfig.name} — beranda`}
    >
      <Logo {...props} />
    </Link>
  );
}

export { Logo, LogoLink, logoSizes };
