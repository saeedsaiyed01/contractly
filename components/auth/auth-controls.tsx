"use client";

import { SignInButton, SignUpButton, UserButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types/form";

export function AuthControls({
  className,
  locale = "en",
}: {
  className?: string;
  locale?: AppLocale;
}) {
  const { isLoaded, isSignedIn } = useAuth();
  const t = useMemo(() => getTranslations(locale), [locale]);

  if (!isLoaded) {
    return (
      <span
        className={cn(
          "inline-block h-9 w-28 shrink-0 rounded-md bg-zinc-800/80 animate-pulse",
          className,
        )}
        aria-hidden
      />
    );
  }

  if (isSignedIn) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Link
          href="/dashboard"
          prefetch={false}
          className="font-sans text-xs font-medium text-zinc-400 hover:text-zinc-100"
        >
          {t.nav.myForms}
        </Link>
        <UserButton
          appearance={{
            elements: {
              avatarBox: "size-9 ring-1 ring-white/10",
            },
          }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex shrink-0 flex-wrap items-center gap-2", className)}>
      <SignInButton mode="redirect">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="border-white/15 bg-zinc-950/80 font-sans text-zinc-100"
        >
          Sign in
        </Button>
      </SignInButton>
      <SignUpButton mode="redirect">
        <Button
          type="button"
          size="sm"
          className="bg-violet-600 font-sans text-white hover:bg-violet-500"
        >
          Sign up
        </Button>
      </SignUpButton>
    </div>
  );
}
