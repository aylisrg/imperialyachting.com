import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getVacancy, isPmsConfigured } from "@/lib/careers/pms";
import { ApplyForm } from "../../ApplyForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Apply — Careers", robots: { index: false } };

export default async function ApplyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!isPmsConfigured()) notFound();
  const v = await getVacancy(id);
  if (!v) notFound();
  return <ApplyForm vacancy={v} />;
}
