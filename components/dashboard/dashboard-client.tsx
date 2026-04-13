"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ChevronRight, Sparkles } from "lucide-react";
import { useLocale } from "next-intl";

import { AuthControls } from "@/components/auth/auth-controls";
import { AppDarkSurface } from "@/components/shell/app-dark-surface";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getTranslations, parseLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

export type DashboardFormRow = {
  id: string;
  title: string;
  status: "draft" | "published";
  slug: string | null;
  updatedAtIso: string;
  submissionCount: number;
};

export function DashboardClient({ rows }: { rows: DashboardFormRow[] }) {
  const locale = useLocale();
  const [lang, setLang] = useState<AppLocale>(() => parseLocale(locale));
  const t = useMemo(() => getTranslations(lang), [lang]);

  return (
    <AppDarkSurface>
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-5 sm:py-12">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="group inline-flex items-center gap-1 font-sans text-sm text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            {t.nav.brand}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <AuthControls locale={lang} />
            <label className="sr-only" htmlFor="dash-lang">
              {t.nav.language}
            </label>
            <select
              id="dash-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value as AppLocale)}
              className="select-app-dark"
              aria-label={t.nav.language}
            >
              {APP_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/8 pb-8">
          <div>
            <h1 className="font-serif text-3xl tracking-tight text-white md:text-[2rem]">
              {t.dashboard.title}
            </h1>
            <p className="mt-2 max-w-md font-sans text-sm leading-relaxed text-zinc-500">
              {t.dashboard.subtitle}
            </p>
          </div>
          <Link
            href="/forms/new"
            prefetch={false}
            className={cn(
              buttonVariants({ size: "sm" }),
              "h-9 gap-1.5 rounded-lg bg-violet-600 font-medium text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500 hover:shadow-violet-900/25",
            )}
          >
            {t.dashboard.newForm}
            <ChevronRight className="size-3.5 opacity-90" aria-hidden />
          </Link>
        </div>

        {rows.length === 0 ? (
          <div className="mt-12 rounded-2xl border border-dashed border-white/12 bg-zinc-950/40 px-6 py-14 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)] backdrop-blur-sm sm:px-10 sm:py-16">
            <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl border border-violet-500/25 bg-linear-to-br from-violet-500/15 to-transparent">
              <Sparkles
                className="size-7 text-violet-300/90"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <p className="font-serif text-xl tracking-tight text-zinc-100">
              {t.dashboard.empty}
            </p>
            <p className="mx-auto mt-3 max-w-sm font-sans text-sm leading-relaxed text-zinc-500">
              {t.dashboard.emptyHint}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/forms/new"
                prefetch={false}
                className={cn(
                  buttonVariants({ size: "default" }),
                  "h-10 rounded-lg bg-violet-600 px-6 text-white shadow-md shadow-violet-950/25 hover:bg-violet-500",
                )}
              >
                {t.dashboard.newForm}
              </Link>
              <Link
                href="/create"
                prefetch={false}
                className={cn(
                  buttonVariants({ variant: "outline", size: "default" }),
                  "h-10 rounded-lg border-white/12 bg-zinc-950/60 text-zinc-200 hover:border-white/18 hover:bg-zinc-900/80",
                )}
              >
                {t.dashboard.startBlank}
              </Link>
            </div>
          </div>
        ) : (
          <ul className="mt-8 space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/forms/${r.id}`}
                  prefetch={false}
                  className="group block rounded-xl border border-white/8 bg-zinc-950/50 px-4 py-4 shadow-sm shadow-black/20 backdrop-blur-sm transition-all duration-200 hover:border-violet-500/25 hover:bg-zinc-900/55 hover:shadow-md hover:shadow-violet-950/10"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans font-medium text-zinc-100 transition-colors group-hover:text-white">
                        {r.title}
                      </p>
                      <p className="mt-1.5 font-mono text-[11px] text-zinc-500">
                        {t.dashboard.updated}{" "}
                        {new Date(r.updatedAtIso).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "border font-sans text-[11px] font-medium",
                          r.status === "published"
                            ? "border-violet-500/35 bg-violet-500/10 text-violet-200"
                            : "border-zinc-600/45 text-zinc-400",
                        )}
                      >
                        {r.status === "published"
                          ? t.manage.statusPublished
                          : t.manage.statusDraft}
                      </Badge>
                      <span className="font-mono text-[11px] tabular-nums text-zinc-500">
                        {r.submissionCount} {t.manage.responseCount}
                      </span>
                      <ChevronRight
                        className="size-4 text-zinc-600 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                        aria-hidden
                      />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </AppDarkSurface>
  );
}
