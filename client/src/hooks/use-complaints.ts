import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertComplaint } from "@shared/schema";

export function useComplaints() {
  return useQuery({
    queryKey: [api.complaints.list.path],
    queryFn: async () => {
      const res = await fetch(api.complaints.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch complaints");
      return api.complaints.list.responses[200].parse(await res.json());
    },
  });
}

export function useComplaintStats() {
  return useQuery({
    queryKey: [api.complaints.stats.path],
    queryFn: async () => {
      const res = await fetch(api.complaints.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.complaints.stats.responses[200].parse(await res.json());
    },
  });
}

export function useCreateComplaint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertComplaint) => {
      // Validate with schema first
      const validated = api.complaints.create.input.parse(data);
      const res = await fetch(api.complaints.create.path, {
        method: api.complaints.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });
      if (!res.ok) {
        if (res.status === 400) {
          const error = api.complaints.create.responses[400].parse(await res.json());
          throw new Error(error.message);
        }
        throw new Error("Failed to create complaint");
      }
      return api.complaints.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.complaints.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.complaints.stats.path] });
    },
  });
}
