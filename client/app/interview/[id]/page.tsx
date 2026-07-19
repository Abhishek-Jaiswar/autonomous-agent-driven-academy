import { notFound } from "next/navigation";
import { InterviewRoom } from "@/components/interview/InterviewRoom";
import type { InterviewState } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InterviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const serverUrl = process.env.SERVER_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  let interview: InterviewState;

  try {
    const res = await fetch(`${serverUrl}/curriculum/interview/${id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      notFound();
    }

    const data = await res.json();

    if (!data.success) {
      notFound();
    }

    interview = data.data as InterviewState;
  } catch {
    notFound();
  }

  return <InterviewRoom interview={interview} />;
}
