import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  buildResponsesCsv,
  buildResponsesJson,
} from "@/lib/export-responses-csv";
import { getFormForBuilder, listSubmissions } from "@/lib/forms";

export async function GET(
  req: Request,
  context: { params: Promise<{ formId: string }> },
) {
  const { userId } = await auth();
  const { formId } = await context.params;
  const form = await getFormForBuilder(formId, userId);
  if (!form) {
    return new NextResponse("Not found", { status: 404 });
  }

  const rows = await listSubmissions(formId, userId);
  const exportRows = rows.map((s) => ({
    createdAt: s.createdAt,
    respondentLocale: s.respondentLocale,
    answers: s.answers.map((a) => ({
      fieldId: a.fieldId,
      valueJson: a.valueJson,
    })),
  }));

  const url = new URL(req.url);
  if (url.searchParams.get("format") === "json") {
    const body = buildResponsesJson(form, exportRows);
    return NextResponse.json(
      { formId: form.id, title: form.title, submissions: body },
      { status: 200 },
    );
  }

  const csv = buildResponsesCsv(form, exportRows);
  return new NextResponse("\uFEFF" + csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="contractly-responses-${formId.slice(0, 8)}.csv"`,
    },
  });
}
