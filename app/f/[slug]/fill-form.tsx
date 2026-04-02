"use client";

import { useMemo, useState, useTransition } from "react";

import { submitFormAction } from "@/app/actions/forms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BuilderForm } from "@/lib/forms";
import { getTranslations } from "@/lib/i18n";
import { pickLocalized } from "@/lib/localized";
import type { AppLocale } from "@/types/form";
import { cn } from "@/lib/utils";

export function FillForm({ form }: { form: BuilderForm }) {
  const [lang, setLang] = useState<AppLocale>("en");
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
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
        });
        setDone(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Submit failed");
      }
    });
  }

  if (done) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center font-sans">
        <p className="text-lg text-foreground">{t.fill.thanks}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-12">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl tracking-tight">{form.title}</h1>
          {pickLocalized(form.description, lang).trim() !== "" && (
            <p className="mt-2 whitespace-pre-wrap font-sans text-sm text-muted-foreground">
              {pickLocalized(form.description, lang)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="fill-lang" className="sr-only">
            {t.fill.pickLanguage}
          </Label>
          <select
            id="fill-lang"
            value={lang}
            onChange={(e) => setLang(e.target.value as AppLocale)}
            className="h-8 rounded-md border border-input bg-background px-2 text-xs"
          >
            <option value="en">EN</option>
            <option value="es">ES</option>
            <option value="hi">HI</option>
          </select>
        </div>
      </div>

      {error && (
        <p className="mb-4 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-8">
        {form.fields.map((field) => {
          const label = pickLocalized(field.label, lang);
          const id = field.id ?? field.clientId;
          return (
            <div key={id} className="space-y-2">
              <Label htmlFor={id}>
                {label}
                {field.required && (
                  <span className="text-destructive"> *</span>
                )}
              </Label>
              {field.type === "short_text" && (
                <Input
                  id={id}
                  value={typeof answers[id] === "string" ? answers[id] : ""}
                  onChange={(e) => setText(id, e.target.value)}
                />
              )}
              {field.type === "email" && (
                <Input
                  id={id}
                  type="email"
                  value={typeof answers[id] === "string" ? answers[id] : ""}
                  onChange={(e) => setText(id, e.target.value)}
                />
              )}
              {field.type === "long_text" && (
                <textarea
                  id={id}
                  rows={4}
                  className={cn(
                    "flex w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm",
                    "placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
                    "dark:bg-input/30",
                  )}
                  value={typeof answers[id] === "string" ? answers[id] : ""}
                  onChange={(e) => setText(id, e.target.value)}
                />
              )}
              {field.type === "multiple_choice" && field.options && (
                <div className="space-y-2">
                  {field.options.map((opt, oi) => (
                    <label
                      key={oi}
                      className="flex cursor-pointer items-center gap-2 font-sans text-sm"
                    >
                      <input
                        type="radio"
                        name={id}
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
        className="mt-10 w-full bg-violet-600 text-white hover:bg-violet-500"
        disabled={pending}
        onClick={() => void handleSubmit()}
      >
        {t.fill.submit}
      </Button>
    </div>
  );
}
