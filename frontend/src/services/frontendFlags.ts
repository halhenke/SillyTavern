import { useQuery } from '@tanstack/react-query';

export type FrontendFlags = {
  reactLoginEnabled: boolean;
  reactShellEnabled: boolean;
  frontendBuildReady: boolean;
};

async function fetchFrontendFlags(): Promise<FrontendFlags> {
  const response = await fetch('/api/frontend/flags');
  if (!response.ok) {
    throw new Error(`Failed to load frontend flags: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<FrontendFlags>;
}

export function useFrontendFlags() {
  return useQuery({
    queryKey: ['frontend-flags'],
    queryFn: fetchFrontendFlags,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}
