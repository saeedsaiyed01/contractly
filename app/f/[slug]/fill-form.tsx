"use client";

import { useMemo, useState, useTransition } from "react";
import { CheckCircle2 } from "lucide-react";

import { submitFormAction } from "@/app/actions/forms";
import { AppDarkSurface } from "@/components/shell/app-dark-surface";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BuilderForm } from "@/lib/forms";
import { getTranslations } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";
import type { AppLocale } from "@/types/form";
import { APP_LOCALES } from "@/types/form";
import { cn } from "@/lib/utils";

const fieldClass = cn(
  "h-10 w-full rounded-xl border border-white/12 bg-zinc-950/45 px-3.5 text-sm text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)] transition-colors",
  "placeholder:text-zinc-600 focus-visible:border-violet-500/45 focus-visible:ring-2 focus-visible:ring-violet-500/25",
);

const textareaClass = cn(
  "flex min-h-[7rem] w-full resize-y rounded-xl border border-white/12 bg-zinc-950/45 px-3.5 py-3 text-sm text-zinc-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]",
  "placeholder:text-zinc-600 focus-visible:border-violet-500/45 focus-visible:ring-2 focus-visible:ring-violet-500/25 focus-visible:outline-none",
);

export function FillForm({ form }: { form: BuilderForm }) {
  const [lang, setLang] = useState<AppLocale>("en");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [honeypot, setHoneypot] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const t = useMemo(() => getTranslations(lang), [lang]);

  function setText(id: string, value: string) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  function setChoice(id: string, index: number) {
    setAnswers((a) => ({ ...a, [id]: index }));
  }

  function handleSubmit() {
    setError(null);
    startTransition(async () => {
      try {
        await submitFormAction({
          formId: form.id,
          answers: answers as Record<string, unknown>,
          respondentLocale: lang,
          _website: honeypot,
        });
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submit failed");
      }
    });
  }

  if (done) {
    return (
      <AppDarkSurface>
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950/60 px-8 py-12 text-center shadow-xl shadow-black/40 backdrop-blur-md">
            <div className="mx-auto mb-5 flex size-16 items-center justify-center rounded-full border border-emerald-500/25 bg-emerald-500/10">
              <CheckCircle2
                className="size-9 text-emerald-400/95"
                strokeWidth={1.5}
                aria-hidden
              />
            </div>
            <p className="font-serif text-xl tracking-tight text-zinc-100">
              {t.fill.thanks}
            </p>
          </div>
        </div>
      </AppDarkSurface>
    );
  }

  return (
    <AppDarkSurface>
      <div className="mx-auto max-w-lg px-4 py-12 sm:py-16">
        <div className="mb-10 flex flex-wrap items-start justify-between gap-4 border-b border-white/8 pb-8">
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-2xl tracking-tight text-white sm:text-[1.75rem]">
              {form.title}
            </h1>
            {pickLocalized(form.description, lang).trim() !== "" && (
              <p className="mt-3 whitespace-pre-wrap font-sans text-sm leading-relaxed text-zinc-400">
                {pickLocalized(form.description, lang)}
              </p>
            )}
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Label htmlFor="fill-lang" className="sr-only">
              {t.fill.pickLanguage}
            </Label>
            <select
              id="fill-lang"
              value={lang}
              onChange={(e) => setLang(e.target.value as AppLocale)}
              className="select-app-dark h-8 text-[11px]"
              aria-label={t.fill.pickLanguage}
            >
              {APP_LOCALES.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p
            className="mb-6 rounded-xl border border-red-500/35 bg-red-950/30 px-4 py-3 text-sm text-red-200"
            role="alert"
          >
            {error}
          </p>
        )}

        <div
          className="pointer-events-none absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden opacity-0"
          aria-hidden
        >
          <label htmlFor="fill-website-hp">Website</label>
          <input
            id="fill-website-hp"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className="space-y-8">
          {form.fields.map((field) => {
            const label = pickLocalized(field.label, lang);
            const id = field.id ?? field.clientId;
            return (
              <div key={id} className="space-y-2.5">
                <Label
                  htmlFor={id}
                  className="font-sans text-sm font-medium text-zinc-200"
                >
                  {label}
                  {field.required && (
                    <span className="text-violet-400"> *</span>
                  )}
                </Label>
                {field.type === "short_text" && (
                  <Input
                    id={id}
                    className={fieldClass}
                    value={typeof answers[id] === "string" ? answers[id] : ""}
                    onChange={(e) => setText(id, e.target.value)}
                  />
                )}
                {field.type === "email" && (
                  <Input
                    id={id}
                    type="email"
                    className={fieldClass}
                    value={typeof answers[id] === "string" ? answers[id] : ""}
                    onChange={(e) => setText(id, e.target.value)}
                  />
                )}
                {field.type === "long_text" && (
                  <textarea
                    id={id}
                    rows={4}
                    className={textareaClass}
                    value={typeof answers[id] === "string" ? answers[id] : ""}
                    onChange={(e) => setText(id, e.target.value)}
                  />
                )}
                {field.type === "number" && (
                  <Input
                    id={id}
                    type="number"
                    step="any"
                    className={fieldClass}
                    value={
                      answers[id] === undefined ? "" : String(answers[id])
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      if (raw === "" || raw === "-") {
                        setAnswers((a) => {
                          const next = { ...a };
                          delete next[id];
                          return next;
                        });
                        return;
                      }
                      const n = Number(raw);
                      if (Number.isFinite(n)) {
                        setAnswers((a) => ({ ...a, [id]: n }));
                      }
                    }}
                  />
                )}
                {field.type === "date" && (
                  <Input
                    id={id}
                    type="date"
                    className={cn(fieldClass, "scheme-dark")}
                    value={typeof answers[id] === "string" ? answers[id] : ""}
                    onChange={(e) => setText(id, e.target.value)}
                  />
                )}
                {field.type === "multiple_choice" && field.options && (
                  <div className="space-y-2 pt-0.5">
                    {field.options.map((opt, oi) => (
                      <label
                        key={oi}
                        className={cn(
                          "flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 font-sans text-sm transition-colors",
                          answers[id] === oi
                            ? "border-violet-500/45 bg-violet-500/10 text-zinc-100"
                            : "border-white/10 bg-zinc-950/35 text-zinc-300 hover:border-white/16 hover:bg-zinc-950/55",
                        )}
                      >
                        <input
                          type="radio"
                          name={id}
                          className="size-4 shrink-0 border-white/20 text-violet-500 focus:ring-violet-500/40"
                          checked={answers[id] === oi}
                          onChange={() => setChoice(id, oi)}
                        />
                        {pickLocalized(opt, lang)}
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          className="mt-12 h-11 w-full rounded-xl bg-violet-600 text-[15px] font-medium text-white shadow-lg shadow-violet-950/30 transition hover:bg-violet-500"
          disabled={pending}
          onClick={() => void handleSubmit()}
        >
          {t.fill.submit}
        </Button>
      </div>
    </AppDarkSurface>
  );
}
