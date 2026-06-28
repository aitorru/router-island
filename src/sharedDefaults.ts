import { requireOptionalNativeModule } from 'expo-modules-core';

import { APP_GROUP, SHARED_KEY_LAST_SNAPSHOT } from './constants';
import type { CreditsSnapshot } from './openrouter';

/**
 * Thin JS wrapper over the local `SharedDefaults` native module, which reads and
 * writes the App Group `UserDefaults` shared with the Live Activity widget and
 * the Siri App Intent. The module is iOS-only and absent in Expo Go / web, so
 * every call degrades to a no-op when it isn't linked.
 */
interface SharedDefaultsModule {
  setItem(suite: string, key: string, value: string): void;
  getItem(suite: string, key: string): string | null;
  removeItem(suite: string, key: string): void;
}

const native = requireOptionalNativeModule<SharedDefaultsModule>('SharedDefaults');

export const isSharedDefaultsAvailable = native != null;

export function setSharedItem(key: string, value: string): void {
  native?.setItem(APP_GROUP, key, value);
}

export function removeSharedItem(key: string): void {
  native?.removeItem(APP_GROUP, key);
}

/**
 * Mirror the latest balance into the App Group so the Live Activity can show a
 * fresh figure instantly while the network fetch (if any) completes.
 */
export function setSharedSnapshot(snapshot: CreditsSnapshot): void {
  native?.setItem(APP_GROUP, SHARED_KEY_LAST_SNAPSHOT, JSON.stringify(snapshot));
}
