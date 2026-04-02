export type AppLocale = "en" | "es" | "hi";

export const APP_LOCALES: AppLocale[] = ["en", "es", "hi"];

export type QuestionType = "short_text" | "long_text" | "email" | "multiple_choice";

export type FormStatus = "draft" | "published";

/** At least English; other locales optional */
export type LocalizedString = {
  en: string;
  es?: string;
  hi?: string;
};

export type FormFieldDraft = {
  /** Set after first save from the server */
  id?: string;
  clientId: string;
  sortOrder: number;
  type: QuestionType;
  required: boolean;
  label: LocalizedString;
  /** Multiple choice options — same shape per row */
  options?: LocalizedString[];
};

export type AnswerPayload = Record<string, unknown>;
