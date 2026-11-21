"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import DashboardPage from "../page";
import { useStore } from "@/store/useStore";
import { syncSessionToUrl } from "@/lib/sessionUrl";

export default function SessionDashboardPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const setSessionId = useStore((state) => state.setSessionId);

  useEffect(() => {
    if (id) {
      setSessionId(id);
      syncSessionToUrl(id);
    }
  }, [id, setSessionId]);

  return <DashboardPage />;
}
