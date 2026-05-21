import type { ReactNode } from "react";
import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { getAdminAuthHeaders } from "@/lib/queryClient";

type AdminMeResponse = {
  ok?: boolean;
  superAdmin?: boolean;
};

export function SuperAdminGuard({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["/api/admin/me"],
    queryFn: async () => {
      const res = await fetch("/api/admin/me", { headers: getAdminAuthHeaders() });
      return (await res.json()) as AdminMeResponse;
    },
  });

  useEffect(() => {
    if (isLoading) return;
    if (!data?.ok || !data.superAdmin) setLocation("/admin");
  }, [data?.ok, data?.superAdmin, isLoading, setLocation]);

  if (isLoading || !data?.ok || !data.superAdmin) {
    return (
      <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div
          style={{
            width: 32,
            height: 32,
            border: "3px solid #0891b2",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  return <>{children}</>;
}
