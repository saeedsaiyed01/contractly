"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import {
  ArrowRight,
  Download,
  GitBranch,
  Languages,
  Link2,
  PenLine,
  Sparkles,
  Star,
} from "lucide-react";

import { AuthControls } from "@/components/auth/auth-controls";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

const STEP_ICONS = [PenLine, Languages, Link2, Download] as const;

export function HomePage() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<AppLocale>("en");
  const t = useMemo(() => getTranslations(lang), [lang]);
  const showDbError = searchParams.get("error") === "database";
  const year = 2026;

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-black text-zinc-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.09]"
        style={{
          backgroundImage:
            "radial-gradient(ellipse 80% 50% at 50% -20%, #5b21b6 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, #1e3a8a 0%, transparent 50%), radial-gradient(ellipse 70% 50% at 0% 100%, #4c1d95 0%, transparent 45%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]"
      />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mx-auto w-full max-w-6xl flex-1 px-5 sm:px-6 lg:px-8">
          {showDbError && (
            <div
              role="alert"
              className="mb-6 mt-6 rounded-xl border border-red-500/35 bg-red-950/35 px-4 py-3 font-sans text-sm text-red-200"
            >
              {t.errors.database}
            </div>
          )}

          <header className="flex items-center justify-between gap-3 border-b border-white/6 py-5 sm:py-6">
            <span className="font-sans text-sm font-semibold tracking-tight text-white">
              {t.nav.brand}
            </span>
            <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
              <label className="sr-only" htmlFor="lang">
                {t.nav.language}
              </label>
              <select
                id="lang"
                value={lang}
                onChange={(e) => setLang(e.target.value as AppLocale)}
                className="h-9 rounded-lg border border-white/10 bg-zinc-950/90 px-2.5 py-1 font-sans text-xs text-zinc-300 outline-none transition-colors hover:border-white/15 focus-visible:ring-2 focus-visible:ring-violet-500/45"
              >
                {APP_LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
              <AuthControls locale={lang} />
              <Link href="/forms/new" prefetch={false}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="border-white/12 bg-zinc-950/80 font-sans text-zinc-100 hover:bg-zinc-900"
                >
                  {t.nav.createForm}
                  <ArrowRight className="ml-1 size-3.5 opacity-80" />
                </Button>
              </Link>
            </div>
          </header>

          <main className="pb-20 pt-12 sm:pb-28 sm:pt-16 md:pt-20">
            {/* Hero */}
            <div className="relative mx-auto max-w-3xl text-center">
              <Badge
                variant="outline"
                className="mb-8 border-violet-500/20 bg-violet-950/30 font-mono text-[11px] font-normal tracking-wide text-violet-200/90"
              >
                <Star className="mr-1.5 size-3.5 text-amber-400" />
                {t.landing.badge}
              </Badge>

              <h1 className="font-serif text-[2.125rem] leading-[1.12] tracking-tight text-white sm:text-5xl md:text-[3.25rem] md:leading-[1.1]">
                <span className="text-zinc-500">{t.landing.hero.muted1}</span>{" "}
                <span className="text-white">{t.landing.hero.strong1}</span>{" "}
                <span className="text-zinc-500">{t.landing.hero.muted2}</span>{" "}
                <span className="text-white">{t.landing.hero.strong2}</span>{" "}
                <span className="text-zinc-500">{t.landing.hero.muted3}</span>
              </h1>

              <p className="mx-auto mt-6 max-w-xl font-sans text-sm leading-relaxed text-zinc-400 sm:text-base">
                {t.landing.sub}
              </p>
              <p className="mx-auto mt-4 max-w-lg font-sans text-sm leading-relaxed text-zinc-500">
                {t.landing.heroLine2}
              </p>

              <p className="mx-auto mt-8 max-w-xl font-mono text-[11px] uppercase tracking-[0.2em] text-zinc-600">
                {t.landing.trustStrip}
              </p>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <Link href="/forms/new" prefetch={false}>
                  <Button
                    type="button"
                    className="h-11 gap-2 rounded-xl bg-violet-600 px-7 font-sans text-white shadow-lg shadow-violet-950/40 transition hover:bg-violet-500"
                  >
                    {t.landing.ctaPrimary}
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
                <Link
                  href="#how-it-works"
                  className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/10 bg-zinc-950/80 px-5 font-sans text-sm font-medium text-zinc-200 transition-colors hover:border-white/15 hover:bg-zinc-900"
                >
                  <GitBranch className="size-4 text-zinc-500" />
                  {t.landing.ctaSecondary}
                </Link>
              </div>
            </div>

            {/* How it works */}
            <section
              id="how-it-works"
              className="mx-auto mt-24 max-w-5xl scroll-mt-24 sm:mt-32"
            >
              <div className="text-center">
                <h2 className="font-serif text-2xl tracking-tight text-white sm:text-3xl">
                  {t.landing.howTitle}
                </h2>
                <p className="mx-auto mt-3 max-w-lg font-sans text-sm text-zinc-500">
                  {t.landing.howSub}
                </p>
              </div>
              <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {t.landing.steps.map((step, i) => {
                  const Icon = STEP_ICONS[i] ?? PenLine;
                  return (
                    <div
                      key={i}
                      className="group relative rounded-2xl border border-white/6 bg-zinc-950/50 p-5 transition-colors hover:border-violet-500/20 hover:bg-zinc-950/80"
                    >
                      <div className="mb-4 flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-violet-500/25 bg-violet-950/40 font-mono text-xs font-medium text-violet-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <Icon
                          className="size-5 text-zinc-500 transition-colors group-hover:text-violet-400/90"
                          strokeWidth={1.75}
                          aria-hidden
                        />
                      </div>
                      <h3 className="font-sans text-sm font-semibold text-zinc-100">
                        {step.title}
                      </h3>
                      <p className="mt-2 font-sans text-xs leading-relaxed text-zinc-500">
                        {step.body}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Highlights */}
            <section className="mx-auto mt-24 max-w-5xl sm:mt-28">
              <div className="flex items-center justify-center gap-2 text-violet-400/90">
                <Sparkles className="size-4" aria-hidden />
                <span className="font-mono text-[11px] uppercase tracking-widest">
                  {t.landing.highlightsTitle}
                </span>
                <Sparkles className="size-4" aria-hidden />
              </div>
              <div className="mt-10 grid gap-5 md:grid-cols-3">
                {t.landing.highlights.map((h, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-white/6 bg-linear-to-b from-zinc-900/40 to-zinc-950/80 p-6"
                  >
                    <h3 className="font-sans text-sm font-semibold text-white">
                      {h.title}
                    </h3>
                    <p className="mt-3 font-sans text-xs leading-relaxed text-zinc-500">
                      {h.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Features */}
            <section
              id="features"
              className="mx-auto mt-24 max-w-5xl scroll-mt-24 sm:mt-28"
            >
              <h2 className="text-center font-serif text-2xl tracking-tight text-white sm:text-3xl">
                {t.landing.featuresTitle}
              </h2>
              <div className="mt-12 grid border-t border-dashed border-white/10 md:grid-cols-3 md:divide-x md:divide-dashed md:divide-white/10">
                {t.landing.features.map((f, i) => (
                  <div
                    key={i}
                    className={cn(
                      "border-b border-dashed border-white/10 px-5 py-10 md:border-b-0 md:px-6",
                      i === 0 && "md:pl-0",
                      i === t.landing.features.length - 1 && "md:pr-0",
                    )}
                  >
                    <h3 className="font-mono text-sm font-medium text-violet-200/90">
                      {f.title}
                    </h3>
                    <p className="mt-4 font-sans text-sm leading-relaxed text-zinc-500">
                      {f.body}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Bottom CTA */}
            <section className="mx-auto mt-24 max-w-3xl sm:mt-32">
              <div className="relative overflow-hidden rounded-3xl border border-violet-500/20 bg-linear-to-br from-violet-950/50 via-zinc-950 to-zinc-950 px-8 py-12 text-center sm:px-12 sm:py-14">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-violet-600/15 blur-3xl"
                />
                <div
                  aria-hidden
                  className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-blue-600/10 blur-3xl"
                />
                <h2 className="relative font-serif text-2xl tracking-tight text-white sm:text-3xl">
                  {t.landing.bottomCtaTitle}
                </h2>
                <p className="relative mx-auto mt-4 max-w-md font-sans text-sm leading-relaxed text-zinc-400">
                  {t.landing.bottomCtaBody}
                </p>
                <div className="relative mt-8">
                  <Link href="/forms/new" prefetch={false}>
                    <Button
                      type="button"
                      className="h-11 rounded-xl bg-white px-8 font-sans font-medium text-zinc-950 shadow-lg hover:bg-zinc-100"
                    >
                      {t.landing.bottomCtaButton}
                      <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </section>
          </main>
        </div>

        {/* Footer */}
        <footer className="relative z-10 mt-auto border-t border-white/6 bg-black/60 backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-5 py-14 sm:px-6 lg:px-8">
            <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <p className="font-sans text-sm font-semibold text-white">
                  {t.nav.brand}
                </p>
                <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-zinc-500">
                  {t.footer.tagline}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 sm:gap-12 lg:col-span-7 lg:grid-cols-2">
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-zinc-600">
                    {t.footer.colProduct}
                  </p>
                  <ul className="mt-4 space-y-3 font-sans text-sm">
                    <li>
                      <Link
                        href="/forms/new"
                        prefetch={false}
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        {t.footer.linkCreate}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard"
                        prefetch={false}
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        {t.footer.linkDashboard}
                      </Link>
                    </li>
                    <li>
                      <a
                        href="#features"
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        {t.footer.linkFeatures}
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-zinc-600">
                    {t.footer.colAccount}
                  </p>
                  <ul className="mt-4 space-y-3 font-sans text-sm">
                    <li>
                      <Link
                        href="/sign-in"
                        prefetch={false}
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        {t.footer.linkSignIn}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/sign-up"
                        prefetch={false}
                        className="text-zinc-400 transition-colors hover:text-white"
                      >
                        {t.footer.linkSignUp}
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-white/6 pt-8 sm:flex-row sm:items-center">
              <p className="font-mono text-[11px] text-zinc-600">
                © {year} {t.nav.brand}. {t.footer.copyright}
              </p>
              <a
                href="#how-it-works"
                className="font-sans text-xs text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {t.landing.ctaSecondary} ↑
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
