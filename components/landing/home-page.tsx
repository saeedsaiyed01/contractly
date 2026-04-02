"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowRight, GitBranch, Star } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

export function HomePage() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<AppLocale>("en");
  const t = useMemo(() => getTranslations(lang), [lang]);
  const showDbError = searchParams.get("error") === "database";

  return (
    <div className="relative min-h-screen overflow-hidden bg-black text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, #4c1d95 0%, transparent 45%), radial-gradient(circle at 80% 20%, #1e3a8a 0%, transparent 40%)",
        }}
      />

      <div className="relative mx-auto flex min-h-screen max-w-5xl flex-col px-6 pb-24 pt-10">
        {showDbError && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-500/40 bg-red-950/40 px-4 py-3 font-sans text-sm text-red-200"
          >
            {t.errors.database}
          </div>
        )}
        <header className="flex items-center justify-between gap-4">
          <span className="font-sans text-sm font-medium tracking-tight">
            {t.nav.brand}
          </span>
          <div className="flex items-center gap-3">
            <label className="sr-only" htmlFor="lang">
              {t.nav.language}
            </label>
            <select
              id="lang"
              value={lang}
              onChange={(e) => setLang(e.target.value as AppLocale)}
              className="rounded-md border border-white/10 bg-zinc-950 px-2 py-1.5 font-sans text-xs text-zinc-300 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
            >
              {APP_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
            <Link href="/forms/new">
              <Button
                type="button"
                variant="outline"
                className="border-white/15 bg-zinc-950/80 font-sans text-zinc-100"
              >
                {t.nav.createForm}
                <span className="inline-flex size-6 items-center justify-center rounded-full border border-white/10">
                  <ArrowRight className="size-3.5" />
                </span>
              </Button>
            </Link>
          </div>
        </header>

        <div className="relative mt-8 flex justify-center">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-px border-l border-dashed border-white/10"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 right-0 w-px border-r border-dashed border-white/10"
          />
          <div className="flex w-full max-w-3xl flex-col items-center px-4 py-16 text-center">
            <Badge
              variant="outline"
              className="mb-8 border-white/10 bg-zinc-950/60 font-mono text-[11px] font-normal tracking-wide text-zinc-400"
            >
              <Star className="mr-1 size-3.5 text-amber-400" />
              {t.landing.badge}
            </Badge>

            <h1 className="font-serif text-4xl leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">
              <span className="text-zinc-500">{t.landing.hero.muted1}</span>{" "}
              <span className="text-white">{t.landing.hero.strong1}</span>{" "}
              <span className="text-zinc-500">{t.landing.hero.muted2}</span>{" "}
              <span className="text-white">{t.landing.hero.strong2}</span>{" "}
              <span className="text-zinc-500">{t.landing.hero.muted3}</span>
            </h1>

            <p className="mt-8 max-w-xl font-sans text-sm leading-relaxed text-zinc-500 sm:text-base">
              {t.landing.sub}
            </p>

            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/forms/new">
                <Button
                  type="button"
                  className="h-11 gap-2 rounded-lg bg-violet-600 px-6 font-sans text-white hover:bg-violet-500"
                >
                  {t.landing.ctaPrimary}
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
              <Link
                href="#features"
                className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/10 bg-zinc-950 px-5 font-sans text-sm font-medium text-zinc-200 transition-colors hover:bg-zinc-900"
              >
                <GitBranch className="size-4" />
                {t.landing.ctaSecondary}
              </Link>
            </div>
          </div>
        </div>

        <section
          id="features"
          className="mt-8 grid border-t border-dashed border-white/10 md:grid-cols-3 md:divide-x md:divide-dashed md:divide-white/10"
        >
          {t.landing.features.map((f, i) => (
            <div
              key={i}
              className="border-b border-dashed border-white/10 px-4 py-10 md:border-b-0"
            >
              <h3 className="font-mono text-sm font-medium text-white">
                {f.title}
              </h3>
              <p className="mt-3 font-mono text-xs leading-relaxed text-zinc-500">
                {f.body}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
