"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import {
  deleteFormAction,
  duplicateFormAction,
  unpublishFormAction,
} from "@/app/actions/forms";
import { AuthControls } from "@/components/auth/auth-controls";
import { CopyPublicLinkButton } from "@/components/forms/copy-public-link-button";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { getTranslations } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";

type FormSummary = {
  id: string;
  title: string;
  status: "draft" | "published";
  slug: string | null;
};

export function ManageFormClient({
  form,
  submissionCount,
  lastSubmissionIso,
}: {
  form: FormSummary;
  submissionCount: number;
  lastSubmissionIso: string | null;
}) {
  const [lang, setLang] = useState<AppLocale>("en");
  const t = useMemo(() => getTranslations(lang), [lang]);
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [origin, setOrigin] = useState("");
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- client-only public URL
    setOrigin(window.location.origin);
  }, []);

  const publicUrl =
    form.slug && origin ? `${origin}/f/${form.slug}` : "";
  const last = lastSubmissionIso ? new Date(lastSubmissionIso) : null;

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
      <div className="relative mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="font-sans text-sm text-zinc-400 hover:text-zinc-100"
          >
            ← {t.nav.brand}
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <AuthControls locale={lang} />
            <label className="sr-only" htmlFor="manage-lang">
              {t.nav.language}
            </label>
            <select
              id="manage-lang"
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

        <h1 className="font-serif text-2xl tracking-tight">{t.manage.title}</h1>
        <p className="mt-2 text-lg font-medium text-zinc-200">{form.title}</p>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-violet-500/40 bg-violet-500/10 text-violet-200"
          >
            {form.status === "published"
              ? t.manage.statusPublished
              : t.manage.statusDraft}
          </Badge>
          <span className="font-mono text-xs text-zinc-500">
            {submissionCount} {t.manage.responseCount}
          </span>
        </div>

        {last && (
          <p className="mt-2 text-sm text-zinc-400">
            {t.manage.lastSubmission}: {last.toLocaleString()}
          </p>
        )}
        {!last && submissionCount === 0 && (
          <p className="mt-2 text-sm text-zinc-400">
            {t.manage.lastSubmission}: {t.manage.noneYet}
          </p>
        )}

        <p className="mt-6 text-sm text-zinc-500">{t.manage.shareToCollect}</p>

        {form.status === "published" && form.slug ? (
          <div className="mt-4 space-y-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4">
            <p className="text-xs font-medium text-zinc-500">
              {t.manage.publicUrl}
            </p>
            <p className="break-all font-mono text-xs text-zinc-300">
              {publicUrl || "…"}
            </p>
            <CopyPublicLinkButton
              url={publicUrl}
              idleLabel={t.manage.copyLink}
              copiedLabel={t.manage.copied}
              disabled={!publicUrl}
              className="border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900"
            />
          </div>
        ) : null}

        <div className="mt-8 flex flex-wrap gap-2">
          <Link
            href={`/builder/${form.id}`}
            className={cn(
              buttonVariants({ variant: "default" }),
              "bg-violet-600 hover:bg-violet-500",
            )}
          >
            {t.manage.editForm}
          </Link>
          <Link
            href={`/forms/${form.id}/responses`}
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-white/15 bg-zinc-950/80 text-zinc-100",
            )}
          >
            {t.manage.viewResponses}
          </Link>
          {form.slug ? (
            <Link
              href={`/f/${form.slug}`}
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "bg-zinc-100 text-zinc-950 hover:bg-white",
              )}
            >
              {t.builder.openPublicForm}
            </Link>
          ) : null}
        </div>

        <div className="mt-10 border-t border-white/10 pt-8">
          <p className="mb-3 font-sans text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t.manage.dangerZone}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="border-white/15 bg-zinc-950/80 text-zinc-100"
              disabled={pending}
              onClick={() => {
                startTransition(async () => {
                  try {
                    await duplicateFormAction(form.id);
                  } catch (e) {
                    console.error(e);
                  }
                });
              }}
            >
              {t.manage.duplicateForm}
            </Button>
            {form.status === "published" ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-amber-500/30 bg-amber-950/20 text-amber-200 hover:bg-amber-950/40"
                disabled={pending}
                onClick={() => {
                  if (!confirm(t.manage.confirmUnpublish)) return;
                  startTransition(async () => {
                    try {
                      await unpublishFormAction(form.id);
                      router.refresh();
                    } catch (e) {
                      console.error(e);
                    }
                  });
                }}
              >
                {t.manage.unpublish}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="destructive"
              size="sm"
              disabled={pending}
              onClick={() => {
                if (!confirm(t.manage.confirmDelete)) return;
                startTransition(async () => {
                  try {
                    await deleteFormAction(form.id);
                  } catch (e) {
                    console.error(e);
                  }
                });
              }}
            >
              {t.manage.deleteForm}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
