import ExpoModulesCore

/// Bridges the React Native app to App Group `UserDefaults`, so values written
/// here (e.g. the OpenRouter API key) are readable by the Live Activity widget
/// extension and the Siri App Intent without launching the JS runtime.
public class SharedDefaultsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("SharedDefaults")

    Function("setItem") { (suite: String, key: String, value: String) in
      UserDefaults(suiteName: suite)?.set(value, forKey: key)
    }

    Function("getItem") { (suite: String, key: String) -> String? in
      UserDefaults(suiteName: suite)?.string(forKey: key)
    }

    Function("removeItem") { (suite: String, key: String) in
      UserDefaults(suiteName: suite)?.removeObject(forKey: key)
    }
  }
}
