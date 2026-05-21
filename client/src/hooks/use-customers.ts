import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { getAdminAuthHeaders } from "@/lib/queryClient";

export function useCustomers({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: [api.customers.list.path],
    enabled,
    queryFn: async () => {
      const res = await fetch(api.customers.list.path, {
        credentials: "include",
        headers: getAdminAuthHeaders(),
      });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      return api.customers.list.responses[200].parse(data);
    },
  });
}
