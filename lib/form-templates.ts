import { nanoid } from "nanoid";

import type { FormFieldDraft, QuestionType } from "@/types/form";

export const TEMPLATE_IDS = ["blank", "contact", "rsvp", "event"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export function isTemplateId(value: string): value is TemplateId {
  return (TEMPLATE_IDS as readonly string[]).includes(value);
}

function draft(
  sortOrder: number,
  type: QuestionType,
  labelEn: string,
  required: boolean,
  choices?: { en: string }[],
): FormFieldDraft {
  const clientId = nanoid();
  const label = { en: labelEn };
  if (type === "multiple_choice") {
    const opts =
      choices?.map((o) => ({ en: o.en })) ??
      [{ en: "Option A" }, { en: "Option B" }];
    return {
      clientId,
      sortOrder,
      type,
      required,
      label,
      options: opts,
    };
  }
  return { clientId, sortOrder, type, required, label };
}

export function getDefaultFormTitle(templateId: TemplateId): string {
  switch (templateId) {
    case "blank":
      return "Untitled form";
    case "contact":
      return "Contact form";
    case "rsvp":
      return "RSVP";
    case "event":
      return "Event registration";
  }
}

export function getTemplateFields(templateId: TemplateId): FormFieldDraft[] {
  switch (templateId) {
    case "blank":
      return [];
    case "contact":
      return [
        draft(0, "short_text", "Full name", true),
        draft(1, "email", "Email", true),
        draft(2, "short_text", "Phone", false),
        draft(3, "long_text", "Message", false),
      ];
    case "rsvp":
      return [
        draft(0, "short_text", "Your name", true),
        draft(1, "multiple_choice", "Will you attend?", true, [
          { en: "Yes" },
          { en: "No" },
          { en: "Maybe" },
        ]),
        draft(2, "short_text", "Dietary restrictions", false),
      ];
    case "event":
      return [
        draft(0, "short_text", "Full name", true),
        draft(1, "email", "Email", true),
        draft(2, "short_text", "Company / organization", false),
        draft(
          3,
          "multiple_choice",
          "Preferred session",
          true,
          [{ en: "Morning" }, { en: "Afternoon" }, { en: "Both" }],
        ),
      ];
  }
}
