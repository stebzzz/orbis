import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { apiRequest } from "./api";

const queryFn: QueryFunction = async ({ queryKey }) => {
  const [endpoint, method = "GET", data] = queryKey as [
    string,
    string?,
    unknown?,
  ];
  
  const options: RequestInit = {
    method,
  };
  
  if (data && method !== "GET") {
    options.body = JSON.stringify(data);
  }
  
  return apiRequest(endpoint, options);
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn,
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error.message.includes("4")) return false;
        return failureCount < 3;
      },
    },
  },
});

// Export apiRequest for backward compatibility
export { apiRequest };
