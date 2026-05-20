import { UploadForm } from "./upload-form";

type SearchParams = { assignment?: string; category?: string };

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  return (
    <UploadForm
      initialAssignmentTitle={sp.assignment}
      initialCategory={sp.category}
    />
  );
}
