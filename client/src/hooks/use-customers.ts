import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useCustomers() {
  return useQuery({
    queryKey: [api.customers.list.path],
    queryFn: async () => {
      const res = await fetch(api.customers.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch customers");
      const data = await res.json();
      return api.customers.list.responses[200].parse(data);
    },
  });
}
