/**
 * v1: every hook/helper returns true (no gating, everyone has full access).
 * Scaffolding exists so v2 (Stripe + paywall, spec §14.2) can drop in without
 * touching call sites. The "plano" label shown in /ajustes is intentionally
 * independent — `useIsPro()` answers "can they use Pro features?" (yes in v1),
 * while the displayed plan label ("Gratuito") reflects the purchased tier.
 */

// Server-side helpers — async so a v2 implementation can hit a table / API.
export async function isPro(_userId: string): Promise<boolean> {
  return true;
}

export async function canAddClient(_userId: string): Promise<boolean> {
  return true;
}

// Client-side hooks — synchronous for now; v2 will likely swap to React Query
// backed by the same server helpers above.
export function useIsPro(): boolean {
  return true;
}

export function useCanAddClient(): boolean {
  return true;
}
