export type AppLocale = "en" | "ar" | "fr" | "es";

export const APP_LOCALES: AppLocale[] = ["en", "ar", "fr", "es"];

export type QuestionType =
  | "short_text"
  | "long_text"
  | "email"
  | "multiple_choice"
  | "number"
  | "date";

export type FormStatus = "draft" | "published";

/** At least English; other locales optional */
export type LocalizedString = {
  en: string;
  ar?: string;
  fr?: string;
  es?: string;
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
