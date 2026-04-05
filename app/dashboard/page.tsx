import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { listFormsForOwner } from "@/lib/forms";

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const rows = await listFormsForOwner(userId);
  const serialized = rows.map((r) => ({
    id: r.id,
    title: r.title,
    status: r.status,
    slug: r.slug,
    updatedAtIso: r.updatedAt.toISOString(),
    submissionCount: r.submissionCount,
  }));

  return <DashboardClient rows={serialized} />;
}
