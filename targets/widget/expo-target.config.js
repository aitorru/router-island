/** @type {import('@bacons/apple-targets/app.plugin').Config} */
module.exports = {
  type: 'widget',
  name: 'RouterIslandWidget',
  deploymentTarget: '16.2',
  // Explicit so the widget extension (and the App Intent running inside it) can
  // read the API key from the App Group's UserDefaults. Must match app.json.
  entitlements: {
    'com.apple.security.application-groups': ['group.com.aitorru.routerisland'],
  },
};
