import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AnalysisView } from "@/components/AnalysisView";

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { id } = await params;
  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <AnalysisView id={id} />
    </div>
  );
}
