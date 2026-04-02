import { nanoid } from "nanoid";
import { create } from "zustand";

import { setLocalizedString } from "@/lib/builder-field-locale";
import type {
  AppLocale,
  FormFieldDraft,
  LocalizedString,
  QuestionType,
} from "@/types/form";

export type BuilderState = {
  formId: string;
  title: string;
  description: LocalizedString;
  appLanguage: AppLocale;
  fields: FormFieldDraft[];
  hydrate: (input: {
    formId: string;
    title: string;
    description?: LocalizedString;
    fields: FormFieldDraft[];
    appLanguage?: AppLocale;
  }) => void;
  setTitle: (title: string) => void;
  updateDescription: (locale: AppLocale, text: string) => void;
  setAppLanguage: (lang: AppLocale) => void;
  addField: (type: QuestionType) => void;
  updateField: (clientId: string, patch: Partial<FormFieldDraft>) => void;
  removeField: (clientId: string) => void;
  moveField: (clientId: string, dir: -1 | 1) => void;
  duplicateField: (clientId: string) => void;
  reset: () => void;
};

const empty = (): Omit<
  BuilderState,
  | "hydrate"
  | "setTitle"
  | "updateDescription"
  | "setAppLanguage"
  | "addField"
  | "updateField"
  | "removeField"
  | "moveField"
  | "duplicateField"
  | "reset"
> => ({
  formId: "",
  title: "",
  description: { en: "" },
  appLanguage: "en",
  fields: [],
});

export const useBuilderStore = create<BuilderState>((set, get) => ({
  ...empty(),

  hydrate: (input) =>
    set({
      formId: input.formId,
      title: input.title,
      description: input.description ?? { en: "" },
      fields: input.fields,
      appLanguage: input.appLanguage ?? "en",
    }),

  setTitle: (title) => set({ title }),

  updateDescription: (locale, text) =>
    set((s) => ({
      description: setLocalizedString(s.description, locale, text),
    })),

  setAppLanguage: (appLanguage) => set({ appLanguage }),

  addField: (type) => {
    const sortOrder = get().fields.length;
    const clientId = nanoid();
    const base: FormFieldDraft = {
      clientId,
      sortOrder,
      type,
      required: false,
      label: { en: "" },
    };
    if (type === "multiple_choice") {
      base.options = [{ en: "Option A" }, { en: "Option B" }];
    }
    set((s) => ({ fields: [...s.fields, base] }));
  },

  duplicateField: (clientId) =>
    set((s) => {
      const idx = s.fields.findIndex((f) => f.clientId === clientId);
      if (idx < 0) return s;
      const f = s.fields[idx];
      if (!f) return s;
      const dup: FormFieldDraft = {
        ...f,
        clientId: nanoid(),
        id: undefined,
        sortOrder: idx + 1,
        label: { ...f.label },
        options: f.options?.map((o) => ({ ...o })),
      };
      const next = [...s.fields];
      next.splice(idx + 1, 0, dup);
      return {
        fields: next.map((field, i) => ({ ...field, sortOrder: i })),
      };
    }),

  updateField: (clientId, patch) =>
    set((s) => ({
      fields: s.fields.map((f) =>
        f.clientId === clientId ? { ...f, ...patch } : f,
      ),
    })),

  removeField: (clientId) =>
    set((s) => {
      const next = s.fields.filter((f) => f.clientId !== clientId);
      return {
        fields: next.map((f, i) => ({ ...f, sortOrder: i })),
      };
    }),

  moveField: (clientId, dir) =>
    set((s) => {
      const idx = s.fields.findIndex((f) => f.clientId === clientId);
      if (idx < 0) return s;
      const j = idx + dir;
      if (j < 0 || j >= s.fields.length) return s;
      const copy = [...s.fields];
      const t = copy[idx];
      const u = copy[j];
      if (!t || !u) return s;
      copy[idx] = u;
      copy[j] = t;
      return {
        fields: copy.map((f, i) => ({ ...f, sortOrder: i })),
      };
    }),

  reset: () => set(empty()),
}));
