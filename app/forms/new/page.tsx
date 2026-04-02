import { TemplateGallery } from "@/components/forms/template-gallery";

export default async function NewFormPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return <TemplateGallery showDbError={error === "database"} />;
}
