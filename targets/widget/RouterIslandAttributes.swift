import ActivityKit
import Foundation

/// Data contract for the OpenRouter-credits Live Activity. Shared by the widget
/// UI (rendering) and the App Intent (which starts/updates the activity).
struct RouterIslandAttributes: ActivityAttributes {
  /// Mutable per-update content shown in the Dynamic Island / Lock Screen.
  public struct ContentState: Codable, Hashable {
    /// Remaining credits in USD, or nil when the key is unlimited.
    var remaining: Double?
    /// Credits already spent, in USD.
    var used: Double
    /// When this figure was fetched.
    var updatedAt: Date
  }

  /// Static title shown alongside the figure.
  var label: String
}
