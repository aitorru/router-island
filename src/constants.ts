/**
 * Shared constants for Router Island.
 *
 * The bundle identifier and App Group must stay in sync with:
 *   - app.json (ios.bundleIdentifier, ios.entitlements)
 *   - targets/widget/expo-target.config.js
 *   - modules/shared-defaults (native App Group suite)
 *   - the Swift App Intent (targets/widget/DisplayCreditsIntent.swift)
 */
export const BUNDLE_ID = 'com.aitorru.routerisland';

/** App Group shared between the RN app, the Live Activity widget and the App Intent. */
export const APP_GROUP = 'group.com.aitorru.routerisland';

/** OpenRouter REST base URL. */
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1';

/** Keychain service used by expo-secure-store for the API key. */
export const KEYCHAIN_SERVICE = 'routerisland.openrouter';

/** SecureStore item key for the OpenRouter API key. */
export const STORAGE_KEY_API_KEY = 'openrouter_api_key';

/**
 * Keys written into the App Group `UserDefaults` so the native App Intent can
 * read them without launching the JS runtime.
 */
export const SHARED_KEY_API_KEY = 'openrouter_api_key';
export const SHARED_KEY_LAST_SNAPSHOT = 'openrouter_last_snapshot';
