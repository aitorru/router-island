import AppIntents
import Foundation

/// App Intent powering the "Display OpenRouter credits left" shortcut.
///
/// Conforming to `LiveActivityStartingIntent` (iOS 18+) lets the intent start a
/// Live Activity from the background, so Siri / Shortcuts can pop the balance
/// into the Dynamic Island without bringing the app to the foreground.
@available(iOS 18.0, *)
struct DisplayCreditsIntent: LiveActivityStartingIntent {
  static var title: LocalizedStringResource = "Display OpenRouter credits left"
  static var description = IntentDescription(
    "Fetches your OpenRouter balance and shows it in the Dynamic Island."
  )
  static var openAppWhenRun: Bool = false

  func perform() async throws -> some IntentResult {
    let state = try await CreditsFetcher.fetch()
    try await CreditsActivityController.start(with: state)
    return .result()
  }
}

/// Registers the Siri phrases. Users can also add the intent manually from the
/// Shortcuts app if the system doesn't surface these automatically.
@available(iOS 18.0, *)
struct RouterIslandShortcuts: AppShortcutsProvider {
  static var appShortcuts: [AppShortcut] {
    AppShortcut(
      intent: DisplayCreditsIntent(),
      phrases: [
        "Display \(.applicationName) credits left",
        "Show my OpenRouter credits in \(.applicationName)",
      ],
      shortTitle: "OpenRouter credits",
      systemImageName: "creditcard.fill"
    )
  }
}
