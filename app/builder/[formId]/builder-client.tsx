"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import {
  AlignLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  CircleDot,
  Copy,
  GripVertical,
  Hash,
  Mail,
  Trash2,
  Type,
} from "lucide-react";

import { publishFormAction, saveDraftAction } from "@/app/actions/forms";
import { AuthControls } from "@/components/auth/auth-controls";
import { CopyPublicLinkButton } from "@/components/forms/copy-public-link-button";
import { AppDarkSurface } from "@/components/shell/app-dark-surface";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  placeholderFromEn,
  setLocalizedString,
  setOptionAtLocale,
} from "@/lib/builder-field-locale";
import type { BuilderForm } from "@/lib/forms";
import { getTranslations } from "@/lib/i18n";
import { useBuilderStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { QuestionType } from "@/types/form";

function fieldTypeLabel(
  t: ReturnType<typeof getTranslations>,
  type: QuestionType,
): string {
  switch (type) {
    case "short_text":
      return t.builder.typeShortText;
    case "long_text":
      return t.builder.typeLongText;
    case "email":
      return t.builder.typeEmail;
    case "multiple_choice":
      return t.builder.typeMultipleChoice;
    case "number":
      return t.builder.typeNumber;
    case "date":
      return t.builder.typeDate;
  }
}

function AddToolButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
    >
      {children}
    </button>
  );
}

export function BuilderClient({ initial }: { initial: BuilderForm }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [origin, setOrigin] = useState("");
  const [activeFieldClientId, setActiveFieldClientId] = useState<
    string | null
  >(null);
  const prevFieldCount = useRef(initial.fields.length);

  const hydrate = useBuilderStore((s) => s.hydrate);
  const formId = useBuilderStore((s) => s.formId);
  const status = useBuilderStore((s) => s.status);
  const slug = useBuilderStore((s) => s.slug);
  const title = useBuilderStore((s) => s.title);
  const description = useBuilderStore((s) => s.description);
  const fields = useBuilderStore((s) => s.fields);
  const appLanguage = useBuilderStore((s) => s.appLanguage);
  const setTitle = useBuilderStore((s) => s.setTitle);
  const updateDescription = useBuilderStore((s) => s.updateDescription);
  const setAppLanguage = useBuilderStore((s) => s.setAppLanguage);
  const addField = useBuilderStore((s) => s.addField);
  const updateField = useBuilderStore((s) => s.updateField);
  const removeField = useBuilderStore((s) => s.removeField);
  const moveField = useBuilderStore((s) => s.moveField);
  const duplicateField = useBuilderStore((s) => s.duplicateField);

  const t = useMemo(() => getTranslations(appLanguage), [appLanguage]);

  useEffect(() => {
    hydrate({
      formId: initial.id,
      title: initial.title,
      description: initial.description,
      fields: initial.fields,
      status: initial.status,
      slug: initial.slug,
    });
  }, [initial, hydrate]);

  useEffect(() => {
    // Client-only share URL base; no SSR value for window.location
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync origin after mount
    setOrigin(window.location.origin);
  }, []);

  useEffect(() => {
    if (fields.length > prevFieldCount.current) {
      const last = fields[fields.length - 1];
      if (last) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- focus newly added field
        setActiveFieldClientId(last.clientId);
      }
    }
    prevFieldCount.current = fields.length;
  }, [fields]);

  const isPublished = status === "published";
  const shareUrl = slug && origin ? `${origin}/f/${slug}` : "";

  const addTools: { type: QuestionType; label: string; icon: ReactNode }[] = [
    {
      type: "short_text",
      label: t.builder.addShortText,
      icon: <Type className="size-5" strokeWidth={1.75} />,
    },
    {
      type: "long_text",
      label: t.builder.addLongText,
      icon: <AlignLeft className="size-5" strokeWidth={1.75} />,
    },
    {
      type: "email",
      label: t.builder.addEmail,
      icon: <Mail className="size-5" strokeWidth={1.75} />,
    },
    {
      type: "multiple_choice",
      label: t.builder.addMultipleChoice,
      icon: <CircleDot className="size-5" strokeWidth={1.75} />,
    },
    {
      type: "number",
      label: t.builder.addNumber,
      icon: <Hash className="size-5" strokeWidth={1.75} />,
    },
    {
      type: "date",
      label: t.builder.addDate,
      icon: <Calendar className="size-5" strokeWidth={1.75} />,
    },
  ];

  async function handleSave() {
    setError(null);
    startTransition(async () => {
      try {
        const next = await saveDraftAction(
          formId,
          title,
          description,
          fields,
        );
        hydrate({
          formId: next.id,
          title: next.title,
          description: next.description,
          fields: next.fields,
          status: next.status,
          slug: next.slug,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  }

  async function handlePublish() {
    setError(null);
    startTransition(async () => {
      try {
        await saveDraftAction(formId, title, description, fields);
        const next = await publishFormAction(formId);
        hydrate({
          formId: next.id,
          title: next.title,
          description: next.description,
          fields: next.fields,
          status: next.status,
          slug: next.slug,
        });
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Publish failed");
      }
    });
  }

  const toolbar = (
    <div
      className="flex flex-row items-center justify-center gap-0.5 rounded-full border border-white/12 bg-zinc-950/90 px-1 py-1 shadow-lg shadow-black/30 md:flex-col"
      role="toolbar"
      aria-label={t.builder.addFieldHint}
    >
      {addTools.map((tool) => (
        <AddToolButton
          key={tool.type}
          label={tool.label}
          disabled={isPublished}
          onClick={() => addField(tool.type)}
        >
          {tool.icon}
        </AddToolButton>
      ))}
    </div>
  );

  return (
    <AppDarkSurface>
      <div className="relative">
        <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-zinc-950/75 backdrop-blur-md supports-[backdrop-filter]:bg-zinc-950/55">
          <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
            <Link
              href="/"
              className="font-sans text-sm font-medium text-zinc-400 hover:text-zinc-100"
            >
              ← {t.builder.backHome}
            </Link>
            <div className="flex flex-wrap items-center gap-2">
              <AuthControls locale={appLanguage} />
              <label className="sr-only" htmlFor="builder-lang">
                {t.nav.language}
              </label>
              <select
                id="builder-lang"
                value={appLanguage}
                onChange={(e) =>
                  setAppLanguage(e.target.value as typeof appLanguage)
                }
                className="select-app-dark py-1.5"
                aria-label={t.nav.language}
              >
                <option value="en">EN</option>
                <option value="es">ES</option>
                <option value="hi">HI</option>
              </select>
              {!isPublished && (
                <>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900"
                    onClick={() => void handleSave()}
                    disabled={pending}
                  >
                    {t.builder.saveDraft}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="bg-violet-600 text-white hover:bg-violet-500"
                    onClick={() => void handlePublish()}
                    disabled={pending}
                  >
                    {t.builder.publish}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 pb-16 pt-6">
          <p className="mb-2 font-sans text-xs text-zinc-500">
            {t.builder.switchLanguageHint}
          </p>

          {isPublished && slug && (
            <div className="mb-6 flex flex-col gap-3 rounded-xl border border-white/10 bg-zinc-950/60 p-4 backdrop-blur-sm">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className="border-violet-500/40 bg-violet-500/10 font-sans text-violet-200"
                >
                  {t.builder.publishedBadge}
                </Badge>
                {shareUrl ? (
                  <span className="break-all font-mono text-[11px] text-zinc-400">
                    {shareUrl}
                  </span>
                ) : null}
              </div>
              <div className="flex flex-wrap gap-2">
                <CopyPublicLinkButton
                  url={shareUrl}
                  idleLabel={t.builder.copyPublicLink}
                  copiedLabel={t.builder.copied}
                  disabled={!shareUrl}
                  className="border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900"
                />
                <Link
                  href={`/f/${slug}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900",
                  )}
                >
                  {t.builder.openPublicForm}
                </Link>
                <Link
                  href={`/forms/${formId}/responses`}
                  className={cn(
                    buttonVariants({ variant: "secondary", size: "sm" }),
                    "bg-zinc-100 text-zinc-950 hover:bg-white",
                  )}
                >
                  {t.builder.viewResponses}
                </Link>
                <Link
                  href={`/forms/${formId}`}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900",
                  )}
                >
                  {t.builder.manageForm}
                </Link>
              </div>
            </div>
          )}

          {error && (
            <p
              className="mb-4 rounded-lg border border-red-500/40 bg-red-950/40 px-3 py-2 text-sm text-red-200"
              role="alert"
            >
              {error}
            </p>
          )}

          <nav
            className="mb-6 flex gap-1 border-b border-white/[0.08] font-sans text-sm font-medium sm:gap-2"
            aria-label="Form editor"
          >
            <span className="-mb-px border-b-2 border-violet-400/90 pb-3 px-1 text-zinc-100">
              {t.builder.tabQuestions}
            </span>
            <Link
              href={`/forms/${formId}/responses`}
              className="-mb-px border-b-2 border-transparent pb-3 px-1 text-zinc-500 transition-colors hover:border-white/10 hover:text-zinc-200"
            >
              {t.builder.tabResponses}
            </Link>
            <Link
              href={`/forms/${formId}`}
              className="-mb-px border-b-2 border-transparent pb-3 px-1 text-zinc-500 transition-colors hover:border-white/10 hover:text-zinc-200"
            >
              {t.builder.tabManage}
            </Link>
          </nav>

          <div className="relative flex gap-3 md:gap-4">
            <div className="min-w-0 flex-1 space-y-4">
              <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-sm backdrop-blur-sm">
                <div className="h-2.5 bg-violet-600" aria-hidden />
                <div className="space-y-4 p-6 md:p-8">
                  <input
                    id="form-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={isPublished}
                    placeholder={t.builder.formTitlePlaceholder}
                    className="w-full border-0 bg-transparent p-0 font-serif text-2xl font-normal tracking-tight text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-0 disabled:opacity-60 md:text-[1.75rem]"
                  />
                  <div>
                    <label htmlFor="form-description" className="sr-only">
                      {t.builder.formDescription}
                    </label>
                    <textarea
                      id="form-description"
                      value={description[appLanguage] ?? ""}
                      placeholder={
                        placeholderFromEn(description, appLanguage) ??
                        t.builder.formDescriptionPlaceholder
                      }
                      onChange={(e) =>
                        updateDescription(appLanguage, e.target.value)
                      }
                      disabled={isPublished}
                      rows={3}
                      className="w-full resize-y border-0 bg-transparent p-0 font-sans text-sm leading-relaxed text-zinc-300 placeholder:text-zinc-500 focus:outline-none focus:ring-0 disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-center md:hidden">{toolbar}</div>

              {fields.length === 0 && (
                <div className="rounded-xl border border-dashed border-white/15 bg-zinc-950/40 px-6 py-14 text-center">
                  <p className="font-sans text-sm text-zinc-400">
                    {t.builder.empty}
                  </p>
                  <p className="mt-2 font-sans text-xs text-zinc-500">
                    {t.builder.addFieldHint}
                  </p>
                </div>
              )}

              {fields.map((field) => {
                const isActive = activeFieldClientId === field.clientId;
                return (
                  <div
                    key={field.clientId}
                    className={cn(
                      "overflow-hidden rounded-xl border border-white/10 bg-zinc-950/80 shadow-sm backdrop-blur-sm transition-shadow",
                      isActive && "border-violet-500/40 ring-2 ring-violet-500/25",
                    )}
                    onFocusCapture={() =>
                      setActiveFieldClientId(field.clientId)
                    }
                    onMouseDown={() => setActiveFieldClientId(field.clientId)}
                  >
                    <div
                      className={cn(
                        "flex border-l-4 border-transparent pl-1 pr-2 md:pr-4",
                        isActive && "border-violet-500",
                      )}
                    >
                      <div
                        className="flex w-8 shrink-0 flex-col items-center pt-4 text-zinc-600 md:w-10"
                        aria-hidden
                      >
                        <GripVertical className="size-5" strokeWidth={1.5} />
                      </div>
                      <div className="min-w-0 flex-1 space-y-4 py-4 pr-2 md:pr-4">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
                          <input
                            id={`label-${field.clientId}`}
                            value={field.label[appLanguage] ?? ""}
                            placeholder={
                              placeholderFromEn(field.label, appLanguage) ??
                              t.builder.questionPlaceholder
                            }
                            onChange={(e) =>
                              updateField(field.clientId, {
                                label: setLocalizedString(
                                  field.label,
                                  appLanguage,
                                  e.target.value,
                                ),
                              })
                            }
                            disabled={isPublished}
                            className="min-w-0 flex-1 border-0 border-b border-white/10 bg-transparent pb-2 font-sans text-base text-zinc-100 placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none disabled:opacity-60"
                          />
                          <span className="shrink-0 rounded-md border border-white/10 bg-zinc-900/80 px-2.5 py-1 font-sans text-xs font-medium text-zinc-400">
                            {fieldTypeLabel(t, field.type)}
                          </span>
                        </div>

                        {field.type === "multiple_choice" && field.options && (
                          <div className="space-y-2 pl-1">
                            {field.options.map((opt, oi) => (
                              <div
                                key={oi}
                                className="flex items-center gap-2 font-sans text-sm"
                              >
                                <span
                                  className="size-4 shrink-0 rounded-full border-2 border-zinc-500"
                                  aria-hidden
                                />
                                <input
                                  value={opt[appLanguage] ?? ""}
                                  placeholder={
                                    placeholderFromEn(opt, appLanguage) ??
                                    `${t.builder.option} ${oi + 1}`
                                  }
                                  onChange={(e) =>
                                    updateField(field.clientId, {
                                      options: setOptionAtLocale(
                                        field,
                                        oi,
                                        appLanguage,
                                        e.target.value,
                                      ),
                                    })
                                  }
                                  disabled={isPublished}
                                  className="min-w-0 flex-1 border-0 border-b border-dotted border-white/15 bg-transparent py-1 text-zinc-200 placeholder:text-zinc-500 focus:border-violet-400 focus:outline-none disabled:opacity-60"
                                  aria-label={`${t.builder.option} ${oi + 1}`}
                                />
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center justify-end gap-4 border-t border-white/10 pt-3">
                          <button
                            type="button"
                            disabled={isPublished}
                            onClick={() => duplicateField(field.clientId)}
                            className="inline-flex items-center gap-1.5 font-sans text-xs text-zinc-500 hover:text-zinc-200 disabled:opacity-40"
                          >
                            <Copy className="size-3.5" />
                            {t.builder.duplicateField}
                          </button>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={isPublished}
                              onClick={() => moveField(field.clientId, -1)}
                              aria-label={t.builder.moveFieldUp}
                            >
                              <ChevronUp className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              disabled={isPublished}
                              onClick={() => moveField(field.clientId, 1)}
                              aria-label={t.builder.moveFieldDown}
                            >
                              <ChevronDown className="size-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon-sm"
                              className="text-zinc-500 hover:text-red-400"
                              disabled={isPublished}
                              onClick={() => {
                                removeField(field.clientId);
                                setActiveFieldClientId((id) =>
                                  id === field.clientId ? null : id,
                                );
                              }}
                              aria-label={t.builder.deleteField}
                            >
                              <Trash2 className="size-4" />
                            </Button>
                          </div>
                          <label className="flex cursor-pointer items-center gap-2 font-sans text-xs text-zinc-400">
                            <input
                              type="checkbox"
                              className="size-4 rounded border-white/20 bg-zinc-900 text-violet-500 focus:ring-violet-500/50"
                              checked={field.required}
                              onChange={(e) =>
                                updateField(field.clientId, {
                                  required: e.target.checked,
                                })
                              }
                              disabled={isPublished}
                            />
                            {t.builder.required}
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isPublished && slug && (
                <div className="flex flex-wrap gap-2 border-t border-white/10 pt-6">
                  <CopyPublicLinkButton
                    url={shareUrl}
                    idleLabel={t.builder.copyPublicLink}
                    copiedLabel={t.builder.copied}
                    disabled={!shareUrl}
                    className="border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900"
                  />
                  <Link
                    href={`/f/${slug}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900",
                    )}
                  >
                    {t.builder.openPublicForm}
                  </Link>
                  <Link
                    href={`/forms/${formId}/responses`}
                    className={cn(
                      buttonVariants({ variant: "secondary" }),
                      "bg-zinc-100 text-zinc-950 hover:bg-white",
                    )}
                  >
                    {t.builder.viewResponses}
                  </Link>
                  <Link
                    href={`/forms/${formId}`}
                    className={cn(
                      buttonVariants({ variant: "outline" }),
                      "border-white/15 bg-zinc-950/80 text-zinc-100 hover:bg-zinc-900",
                    )}
                  >
                    {t.builder.manageForm}
                  </Link>
                </div>
              )}
            </div>

            <div className="hidden pt-2 md:block">
              <div className="sticky top-24">{toolbar}</div>
            </div>
          </div>
        </div>
      </div>
    </AppDarkSurface>
  );
}
