"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { AuthControls } from "@/components/auth/auth-controls";
import { CopyPublicLinkButton } from "@/components/forms/copy-public-link-button";
import { buttonVariants } from "@/components/ui/button";
import type { BuilderForm } from "@/lib/forms";
import { getTranslations } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";
import { answerDisplay } from "@/lib/responses-display";
import { cn } from "@/lib/utils";
import type { AppLocale, FormFieldDraft } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

export type SubmissionRow = {
  id: string;
  createdAt: string;
  respondentLocale: string | null;
  answers: { id: string; fieldId: string; valueJson: unknown }[];
};

export function ResponsesView({
  form,
  rows,
}: {
  form: BuilderForm;
  rows: SubmissionRow[];
}) {
  const [lang, setLang] = useState<AppLocale>("en");
  const t = useMemo(() => getTranslations(lang), [lang]);

  const fieldById = useMemo(
    () => new Map(form.fields.map((f) => [f.id ?? f.clientId, f])),
    [form.fields],
  );

  const lastAt = useMemo(() => {
    if (rows.length === 0) return null;
    const max = Math.max(
      ...rows.map((r) => new Date(r.createdAt).getTime()),
    );
    return new Date(max);
  }, [rows]);

  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only public URL
    setOrigin(window.location.origin);
  }, []);
  const publicUrl =
    form.slug && origin ? `${origin}/f/${form.slug}` : "";

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
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl text-zinc-100">
              {t.responses.title}
            </h1>
            <p className="text-sm text-zinc-400">{form.title}</p>
            <p className="mt-2 font-mono text-xs text-zinc-500">
              {rows.length} {t.responses.count}
              {lastAt && (
                <>
                  {" · "}
                  {t.responses.lastResponse}: {lastAt.toLocaleString()}
                </>
              )}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 sm:flex-row sm:items-center">
            <div className="flex flex-wrap items-center gap-2">
              <AuthControls locale={lang} />
              <label className="sr-only" htmlFor="responses-lang">
                {t.responses.labelLocale}
              </label>
              <span className="hidden text-xs text-zinc-500 sm:inline">
                {t.responses.labelLocale}
              </span>
              <select
                id="responses-lang"
                value={lang}
                onChange={(e) => setLang(e.target.value as AppLocale)}
                className="h-9 rounded-md border border-white/10 bg-zinc-950 px-2 text-xs text-zinc-300"
                aria-label={t.responses.labelLocale}
              >
                {APP_LOCALES.map((l) => (
                  <option key={l} value={l}>
                    {l.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/forms/${form.id}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/15 bg-zinc-950/80 text-zinc-100",
                )}
              >
                {t.responses.manageForm}
              </Link>
              <Link
                href={`/builder/${form.id}`}
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/15 bg-zinc-950/80 text-zinc-100",
                )}
              >
                {t.responses.back}
              </Link>
              {form.slug && (
                <Link
                  href={`/f/${form.slug}`}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "sm" }),
                    "bg-zinc-100 text-zinc-950 hover:bg-white",
                  )}
                >
                  {t.builder.openPublicForm}
                </Link>
              )}
              <a
                href={`/api/forms/${form.id}/export`}
                download
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-emerald-500/30 bg-emerald-950/20 text-emerald-200 hover:bg-emerald-950/40",
                )}
              >
                {t.responses.downloadCsv}
              </a>
              <a
                href={`/api/forms/${form.id}/export?format=json`}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  buttonVariants({ variant: "outline", size: "sm" }),
                  "border-white/15 bg-zinc-950/80 text-zinc-100",
                )}
              >
                {t.responses.downloadJson}
              </a>
            </div>
          </div>
        </div>

        {rows.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 bg-zinc-950/40 px-6 py-12 text-center">
            <p className="font-sans text-sm text-zinc-400">
              {t.responses.empty}
            </p>
            <p className="mt-2 font-sans text-xs text-zinc-500">
              {t.responses.emptyHint}
            </p>
            {form.slug && publicUrl ? (
              <div className="mt-6 flex justify-center">
                <CopyPublicLinkButton
                  url={publicUrl}
                  idleLabel={t.manage.copyLink}
                  copiedLabel={t.manage.copied}
                  className="border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900"
                />
              </div>
            ) : null}
          </div>
        ) : (
          <ul className="space-y-6">
            {rows.map((s) => {
              const created = new Date(s.createdAt);
              return (
                <li
                  key={s.id}
                  className="rounded-xl border border-white/10 bg-zinc-950/60 p-4 font-sans text-sm shadow-sm backdrop-blur-sm"
                >
                  <div className="mb-3 flex flex-wrap justify-between gap-2 border-b border-white/10 pb-2 text-xs text-zinc-500">
                    <span className="font-mono">{s.id.slice(0, 8)}…</span>
                    <time dateTime={created.toISOString()}>
                      {created.toLocaleString()}
                    </time>
                    {s.respondentLocale && (
                      <span className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono uppercase text-zinc-300">
                        {s.respondentLocale}
                      </span>
                    )}
                  </div>
                  <dl className="space-y-2">
                    {s.answers.map((a) => {
                      const field = fieldById.get(a.fieldId) as
                        | FormFieldDraft
                        | undefined;
                      const label = field
                        ? pickLocalized(field.label, lang)
                        : a.fieldId;
                      return (
                        <div
                          key={a.id}
                          className="grid gap-1 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
                        >
                          <dt className="text-zinc-500">{label}</dt>
                          <dd className="wrap-break-word font-mono text-xs text-zinc-200">
                            {answerDisplay(field, a.valueJson, lang)}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
