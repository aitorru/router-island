import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

import { KEYCHAIN_SERVICE, SHARED_KEY_API_KEY, STORAGE_KEY_API_KEY } from './constants';
import { setSharedItem, removeSharedItem } from './sharedDefaults';

const secureOptions: SecureStore.SecureStoreOptions = {
  keychainService: KEYCHAIN_SERVICE,
};

/**
 * Persist the OpenRouter API key. Canonical copy lives in the Keychain (via
 * SecureStore); a mirror is written to the App Group so the native App Intent
 * can fetch the balance without launching the JS runtime.
 *
 * NOTE: the App Group mirror is not Keychain-encrypted. For a single-user app
 * holding its own key this is an accepted trade-off; see README for hardening.
 */
export async function saveApiKey(apiKey: string): Promise<void> {
  const trimmed = apiKey.trim();
  await SecureStore.setItemAsync(STORAGE_KEY_API_KEY, trimmed, secureOptions);
  if (Platform.OS === 'ios') {
    setSharedItem(SHARED_KEY_API_KEY, trimmed);
  }
}

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEY_API_KEY, secureOptions);
}

export async function clearApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY_API_KEY, secureOptions);
  if (Platform.OS === 'ios') {
    removeSharedItem(SHARED_KEY_API_KEY);
  }
}
