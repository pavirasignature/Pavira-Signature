import { Metadata } from "next";
import SessionClient from "./SessionClient";
import PublicLayout from "@/components/layout/PublicLayout";

interface SessionPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export async function generateMetadata({ params }: SessionPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  return {
    title: `Active Session | Pavira Signature`,
    description: `Authenticated luxury session ${resolvedParams.id} for Pavira Signature member portal.`,
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SessionPage({ params }: SessionPageProps) {
  const resolvedParams = await params;
  return (
    <PublicLayout>
      <SessionClient sessionId={resolvedParams.id} />
    </PublicLayout>
  );
}
