import { requireSupabase } from '@/lib/supabase';
import type { LocationType } from '@/lib/types';

export type CreatePaynowInput = {
  amountCents: number;
  currency?: 'sgd';
  topicKey: string;
  subject: string;
  mins: number;
  price: number;
  location: LocationType;
  note?: string | null;
};

export type CreatePaynowResult = {
  paymentIntentId: string;
  clientSecret: string;
  qrImageUrl: string;
  hostedInstructionsUrl: string | null;
  status: string;
};

export type PaynowStatusResult = {
  paymentIntentId: string;
  status: string;
  tutoringRequestId: string | null;
};

function functionsErrorMessage(err: unknown, data: unknown): string {
  if (data && typeof data === 'object' && 'error' in data) {
    const e = (data as { error?: unknown }).error;
    if (typeof e === 'string' && e.trim()) return e;
  }
  if (err && typeof err === 'object' && 'message' in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === 'string' && m.trim()) return m;
  }
  return 'PayNow request failed';
}

export async function createPaynowPayment(
  input: CreatePaynowInput,
): Promise<CreatePaynowResult> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke('create-paynow-payment', {
    body: {
      amountCents: input.amountCents,
      currency: input.currency ?? 'sgd',
      topicKey: input.topicKey,
      subject: input.subject,
      mins: input.mins,
      price: input.price,
      location: input.location,
      note: input.note ?? null,
    },
  });
  if (error || !data || typeof data !== 'object' || !('paymentIntentId' in data)) {
    throw new Error(functionsErrorMessage(error, data));
  }
  const d = data as CreatePaynowResult;
  if (!d.qrImageUrl || !d.paymentIntentId) {
    throw new Error('PayNow QR was not returned');
  }
  return d;
}

export async function fetchPaynowStatus(
  paymentIntentId: string,
): Promise<PaynowStatusResult> {
  const sb = requireSupabase();
  const { data, error } = await sb.functions.invoke('paynow-status', {
    body: { paymentIntentId },
  });
  if (error || !data || typeof data !== 'object' || !('status' in data)) {
    throw new Error(functionsErrorMessage(error, data));
  }
  return data as PaynowStatusResult;
}

/** True when a Stripe publishable key is present (client-side gate only). */
export function isStripePublishableConfigured(): boolean {
  const k = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? '';
  return k.length > 0 && k !== 'pk_test_YOUR_KEY';
}
