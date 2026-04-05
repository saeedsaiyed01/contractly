import { describe, expect, it } from "vitest";

import { buildResponsesCsv } from "@/lib/export-responses-csv";
import type { BuilderForm } from "@/lib/forms";

const sampleForm: BuilderForm = {
  id: "form-1",
  title: "Sample",
  description: { en: "" },
  status: "published",
  slug: "abc",
  fields: [
    {
      clientId: "f-a",
      id: "f-a",
      sortOrder: 0,
      type: "short_text",
      required: false,
      label: { en: "Name" },
    },
  ],
};

describe("buildResponsesCsv", () => {
  it("includes headers and answer cells", () => {
    const csv = buildResponsesCsv(sampleForm, [
      {
        createdAt: new Date("2024-06-01T12:00:00.000Z"),
        respondentLocale: "en",
        answers: [{ fieldId: "f-a", valueJson: "Ada" }],
      },
    ]);
    expect(csv).toContain("submitted_at");
    expect(csv).toContain("Name");
    expect(csv).toContain("Ada");
    expect(csv).toContain("2024-06-01T12:00:00.000Z");
  });
});
