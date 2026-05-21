import { createServiceClient } from "@/lib/supabase/server";
import { fetchAssignments } from "@/lib/assignments-server";
import { UploadForm } from "./upload-form";

type SearchParams = { assignment?: string; category?: string };

export default async function UploadPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const supabase = createServiceClient();
  const assignments = await fetchAssignments(supabase, { activeOnly: true });

  return (
    <UploadForm
      assignments={assignments}
      initialAssignmentTitle={sp.assignment}
      initialCategory={sp.category}
    />
  );
}
