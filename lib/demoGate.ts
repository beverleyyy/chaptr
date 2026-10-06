/**
 * Synchronous investor-demo flag.
 * DemoContext sets this before React re-renders so route guards and API
 * modules cannot touch Supabase or Stripe on the same turn as "Try the demo".
 */
let active = false;

export function isInvestorDemo(): boolean {
  return active;
}

export function setInvestorDemoActive(next: boolean): void {
  active = next;
}

/** Writes and payment calls must fail closed while the pitch demo is on. */
export function assertNotInvestorDemo(): void {
  if (active) {
    throw new Error('Demo mode does not save or take payment');
  }
}
