import { QueryClient } from "@tanstack/react-query";

// ═══════════════════════════════════════════════════════════════════════════════
// React Query Configuration for Optimized Data Fetching
// ═══════════════════════════════════════════════════════════════════════════════

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Cache time: 5 minutes (previously unlimited)
            staleTime: 5 * 60 * 1000,
            // Cache time for unused queries: 10 minutes
            gcTime: 10 * 60 * 1000,
            // Number of retry attempts: 3
            retry: 3,
            // Retry delay: exponential backoff (start at 1s, double each retry)
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch on window focus: enabled for data freshness
            refetchOnWindowFocus: true,
            // Refetch on mount: only if stale data exists
            refetchOnMount: "always",
            // Do not refetch when the query is already hidden (tab inactive)
            enabled: true,
            // Throw error instead of returning error state
            throwOnError: false,
        },
        mutations: {
            // Retry mutations once on failure
            retry: 1,
        },
    },
});

// ═══════════════════════════════════════════════════════════════════════════════
// Query Keys Factory - Centralized query key management
// ═══════════════════════════════════════════════════════════════════════════════

export const queryKeys = {
    // Auth
    session: ["session"] as const,
    profile: ["profile"] as const,

    // Data
    employees: (filters?: Record<string, unknown>) => ["employees", filters] as const,
    projects: (filters?: Record<string, unknown>) => ["projects", filters] as const,
    reports: (filters?: Record<string, unknown>) => ["reports", filters] as const,
    announcements: (filters?: Record<string, unknown>) => ["announcements", filters] as const,
    projectItems: (projectId?: string) => ["projectItems", projectId] as const,
    materialConsumption: (projectId?: string) => ["materialConsumption", projectId] as const,
};

// ═══════════════════════════════════════════════════════════════════════════════
// Query Configuration for Specific Data Types
// ═══════════════════════════════════════════════════════════════════════════════

export const queryConfigs = {
    // Employee queries - cache for 5 minutes
    employees: {
        staleTime: 5 * 60 * 1000,
        refetchInterval: false,
    },

    // Project queries - cache for 3 minutes (frequently updated)
    projects: {
        staleTime: 3 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000, // Auto-refresh every 5 minutes
    },

    // Reports queries - cache for 2 minutes
    reports: {
        staleTime: 2 * 60 * 1000,
        refetchInterval: false,
    },

    // Announcements - cache for 1 minute (real-time important)
    announcements: {
        staleTime: 1 * 60 * 1000,
        refetchInterval: 2 * 60 * 1000, // Auto-refresh every 2 minutes
    },

    // Static data (project items, materials) - cache for 10 minutes
    projectItems: {
        staleTime: 10 * 60 * 1000,
        refetchInterval: false,
    },
};

// ═══════════════════════════════════════════════════════════════════════════════
// Prefetch Helper - Preload data before navigation
// ═══════════════════════════════════════════════════════════════════════════════

export const prefetchData = async (
    client: typeof queryClient,
    key: readonly unknown[],
    fetcher: () => Promise<unknown>
) => {
    await client.prefetchQuery({
        queryKey: key,
        queryFn: fetcher,
        staleTime: queryConfigs.projects.staleTime,
    });
};

// ═══════════════════════════════════════════════════════════════════════════════
// Invalidation Helpers - Selective cache invalidation
// ═══════════════════════════════════════════════════════════════════════════════

export const invalidateQueries = {
    // Invalidate all project-related queries
    projects: (client: typeof queryClient) => {
        client.invalidateQueries({ queryKey: ["projects"] });
    },

    // Invalidate all reports-related queries
    reports: (client: typeof queryClient) => {
        client.invalidateQueries({ queryKey: ["reports"] });
    },

    // Invalidate all data (full cache clear)
    all: (client: typeof queryClient) => {
        client.invalidateQueries();
    },
};

export default queryClient;
