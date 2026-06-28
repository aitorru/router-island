import SwiftUI
import WidgetKit

/// Entry point for the widget extension. Only the Live Activity is registered;
/// add home-screen widgets here later if desired.
@main
struct RouterIslandWidgetBundle: WidgetBundle {
  var body: some Widget {
    RouterIslandLiveActivity()
  }
}
