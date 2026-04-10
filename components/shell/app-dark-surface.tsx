import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type AppDarkSurfaceProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Shared backdrop for app screens: mesh glow, vignette, and subtle grain.
 */
export function AppDarkSurface({ children, className }: AppDarkSurfaceProps) {
  return (
    <div
      className={cn(
        "relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div
          className="absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage: `radial-gradient(ellipse 100% 85% at 50% -32%, rgba(139, 92, 246, 0.42) 0%, transparent 58%),
              radial-gradient(ellipse 58% 48% at 100% 0%, rgba(59, 130, 246, 0.16) 0%, transparent 52%),
              radial-gradient(ellipse 72% 52% at 0% 100%, rgba(167, 139, 250, 0.14) 0%, transparent 50%)`,
          }}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_0%,rgba(0,0,0,0.5)_100%)]" />
        <div className="absolute inset-0 bg-linear-to-b from-black/25 via-transparent to-black/85" />
        <div
          className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
