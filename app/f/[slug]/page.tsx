import { notFound } from "next/navigation";

import { FillForm } from "@/app/f/[slug]/fill-form";
import { getPublishedFormBySlug } from "@/lib/forms";

export default async function PublicFormPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const form = await getPublishedFormBySlug(slug);
  if (!form) notFound();
  return <FillForm form={form} />;
}
