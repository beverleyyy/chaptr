import type { Href } from 'expo-router';

type BackRouter = {
  canGoBack: () => boolean;
  back: () => void;
  replace: (href: Href) => void;
};

/**
 * Leave the current screen. A cold open (deep link / pasted URL) has an empty
 * stack, so `router.back()` would no-op — replace with `fallback` instead.
 */
export function goBackOrReplace(router: BackRouter, fallback: Href): void {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace(fallback);
}
