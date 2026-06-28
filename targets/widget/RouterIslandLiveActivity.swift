import ActivityKit
import SwiftUI
import WidgetKit

/// Live Activity that renders the OpenRouter balance on the Lock Screen and
/// across the three Dynamic Island presentations (expanded / compact / minimal).
struct RouterIslandLiveActivity: Widget {
  var body: some WidgetConfiguration {
    ActivityConfiguration(for: RouterIslandAttributes.self) { context in
      LockScreenView(label: context.attributes.label, state: context.state)
        .padding()
        .activityBackgroundTint(Color.black.opacity(0.55))
        .activitySystemActionForegroundColor(.white)
    } dynamicIsland: { context in
      DynamicIsland {
        DynamicIslandExpandedRegion(.leading) {
          Label("OpenRouter", systemImage: "creditcard.fill")
            .labelStyle(.iconOnly)
            .foregroundStyle(.purple)
            .padding(.leading, 4)
        }
        DynamicIslandExpandedRegion(.trailing) {
          Text(formatCredits(context.state.remaining))
            .font(.system(.title3, design: .rounded).weight(.bold))
            .monospacedDigit()
            .foregroundStyle(.green)
            .padding(.trailing, 4)
        }
        DynamicIslandExpandedRegion(.bottom) {
          HStack {
            Text("Credits left")
              .font(.caption)
              .foregroundStyle(.secondary)
            Spacer()
            Text("used \(formatCredits(context.state.used))")
              .font(.caption2)
              .foregroundStyle(.secondary)
          }
        }
      } compactLeading: {
        Image(systemName: "creditcard.fill")
          .foregroundStyle(.purple)
      } compactTrailing: {
        Text(formatCredits(context.state.remaining))
          .monospacedDigit()
          .foregroundStyle(.green)
      } minimal: {
        Image(systemName: "creditcard.fill")
          .foregroundStyle(.green)
      }
      .keylineTint(.purple)
    }
  }
}

/// Lock Screen / banner presentation.
private struct LockScreenView: View {
  let label: String
  let state: RouterIslandAttributes.ContentState

  var body: some View {
    HStack(spacing: 14) {
      Image(systemName: "creditcard.fill")
        .font(.title2)
        .foregroundStyle(.purple)
      VStack(alignment: .leading, spacing: 2) {
        Text(label)
          .font(.caption)
          .foregroundStyle(.secondary)
        Text(formatCredits(state.remaining))
          .font(.system(.title, design: .rounded).weight(.bold))
          .monospacedDigit()
          .foregroundStyle(.green)
      }
      Spacer()
      VStack(alignment: .trailing, spacing: 2) {
        Text("used")
          .font(.caption2)
          .foregroundStyle(.secondary)
        Text(formatCredits(state.used))
          .font(.callout)
          .monospacedDigit()
          .foregroundStyle(.white)
      }
    }
  }
}
