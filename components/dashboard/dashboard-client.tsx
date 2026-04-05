"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { AuthControls } from "@/components/auth/auth-controls";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
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
  const [lang, setLang] = useState<AppLocale>("en");
  const t = useMemo(() => getTranslations(lang), [lang]);

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
      <div className="relative mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="font-sans text-sm text-zinc-400 hover:text-zinc-100"
          >
            ← {t.nav.brand}
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
              className="h-9 rounded-md border border-white/10 bg-zinc-950 px-2 text-xs text-zinc-300 outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50"
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

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl tracking-tight md:text-3xl">
              {t.dashboard.title}
            </h1>
            <p className="mt-1 font-sans text-sm text-zinc-500">
              {t.dashboard.subtitle}
            </p>
          </div>
          <Link
            href="/forms/new"
            prefetch={false}
            className={cn(
              buttonVariants({ size: "sm" }),
              "bg-violet-600 text-white hover:bg-violet-500",
            )}
          >
            {t.dashboard.newForm}
          </Link>
        </div>

        {rows.length === 0 ? (
          <p className="mt-12 font-sans text-sm text-zinc-500">
            {t.dashboard.empty}
          </p>
        ) : (
          <ul className="mt-8 space-y-3">
            {rows.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/forms/${r.id}`}
                  prefetch={false}
                  className="block rounded-xl border border-white/10 bg-zinc-950/60 px-4 py-4 transition-colors hover:border-white/20"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-sans font-medium text-zinc-100">
                        {r.title}
                      </p>
                      <p className="mt-1 font-mono text-xs text-zinc-500">
                        {t.dashboard.updated}{" "}
                        {new Date(r.updatedAtIso).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          r.status === "published"
                            ? "border-violet-500/40 bg-violet-500/10 text-violet-200"
                            : "border-zinc-600/50 text-zinc-400",
                        )}
                      >
                        {r.status === "published"
                          ? t.manage.statusPublished
                          : t.manage.statusDraft}
                      </Badge>
                      <span className="font-mono text-xs text-zinc-500">
                        {r.submissionCount} {t.manage.responseCount}
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
