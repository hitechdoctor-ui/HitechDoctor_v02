import { QueryClient, QueryFunction } from "@tanstack/react-query";

const HITECH_ADMIN_TOKEN_KEY = "hitech_admin_token";

/** Authorization header για κλήσεις admin API όταν υπάρχει token στο localStorage. */
export function getAdminAuthHeaders(): Record<string, string> {
  try {
    const token = localStorage.getItem(HITECH_ADMIN_TOKEN_KEY);
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: {
      ...(data ? { "Content-Type": "application/json" } : {}),
      ...getAdminAuthHeaders(),
    },
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
      headers: getAdminAuthHeaders(),
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

/** React-query key + invalidation για έσοδα επισκευών (Οικονομικά / Dashboard). */
export const QUERY_FINANCIAL_REPAIR_REVENUE = ["/api/financial/repair-revenue"] as const;

export function invalidateRepairFinancialQueries(queryClient: QueryClient) {
  queryClient.invalidateQueries({ queryKey: [...QUERY_FINANCIAL_REPAIR_REVENUE] });
}
