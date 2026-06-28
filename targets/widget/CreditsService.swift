import ActivityKit
import Foundation

/// Shared identifiers — keep in sync with `src/constants.ts`.
enum CreditsConfig {
  static let appGroup = "group.com.aitorru.routerisland"
  static let baseURL = "https://openrouter.ai/api/v1"
  static let keyApiKey = "openrouter_api_key"
}

enum CreditsError: LocalizedError {
  case missingKey
  case http(Int)
  case activitiesDisabled

  var errorDescription: String? {
    switch self {
    case .missingKey: return "No OpenRouter API key found. Open Router Island and add one."
    case .http(let code): return "OpenRouter returned HTTP \(code)."
    case .activitiesDisabled: return "Live Activities are disabled for Router Island."
    }
  }
}

/// Formats a credit amount as USD, or an em dash when unknown.
func formatCredits(_ amount: Double?) -> String {
  guard let amount else { return "—" }
  let formatter = NumberFormatter()
  formatter.numberStyle = .currency
  formatter.currencyCode = "USD"
  formatter.maximumFractionDigits = 2
  return formatter.string(from: NSNumber(value: amount)) ?? "$\(amount)"
}

/// Reads the API key from the App Group and fetches the balance from OpenRouter,
/// mirroring the JS client: try `/credits`, fall back to `/auth/key`.
enum CreditsFetcher {
  private struct CreditsResponse: Decodable {
    struct Data: Decodable { let total_credits: Double?; let total_usage: Double? }
    let data: Data?
  }
  private struct KeyResponse: Decodable {
    struct Data: Decodable { let usage: Double?; let limit: Double? }
    let data: Data?
  }

  static func fetch() async throws -> RouterIslandAttributes.ContentState {
    guard
      let defaults = UserDefaults(suiteName: CreditsConfig.appGroup),
      let key = defaults.string(forKey: CreditsConfig.keyApiKey),
      !key.isEmpty
    else {
      throw CreditsError.missingKey
    }

    if let credits = try? await getCredits(key: key) {
      return credits
    }
    return try await getKeyInfo(key: key)
  }

  private static func request(_ path: String, key: String) async throws -> Data {
    var req = URLRequest(url: URL(string: CreditsConfig.baseURL + path)!)
    req.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
    let (data, response) = try await URLSession.shared.data(for: req)
    if let http = response as? HTTPURLResponse, !(200...299).contains(http.statusCode) {
      throw CreditsError.http(http.statusCode)
    }
    return data
  }

  private static func getCredits(key: String) async throws -> RouterIslandAttributes.ContentState {
    let data = try await request("/credits", key: key)
    let parsed = try JSONDecoder().decode(CreditsResponse.self, from: data)
    let total = parsed.data?.total_credits ?? 0
    let used = parsed.data?.total_usage ?? 0
    return .init(remaining: total - used, used: used, updatedAt: Date())
  }

  private static func getKeyInfo(key: String) async throws -> RouterIslandAttributes.ContentState {
    let data = try await request("/auth/key", key: key)
    let parsed = try JSONDecoder().decode(KeyResponse.self, from: data)
    let used = parsed.data?.usage ?? 0
    let limit = parsed.data?.limit
    return .init(remaining: limit.map { $0 - used }, used: used, updatedAt: Date())
  }
}

/// Starts (or refreshes) the single OpenRouter-credits Live Activity.
enum CreditsActivityController {
  static func start(with state: RouterIslandAttributes.ContentState) async throws {
    guard ActivityAuthorizationInfo().areActivitiesEnabled else {
      throw CreditsError.activitiesDisabled
    }

    // Refresh an existing activity instead of stacking a new one.
    if let existing = Activity<RouterIslandAttributes>.activities.first {
      await existing.update(ActivityContent(state: state, staleDate: staleDate()))
      return
    }

    let attributes = RouterIslandAttributes(label: "OpenRouter")
    _ = try Activity.request(
      attributes: attributes,
      content: ActivityContent(state: state, staleDate: staleDate()),
      pushType: nil
    )
  }

  private static func staleDate() -> Date {
    // Mark the figure as stale after an hour so the system dims it.
    Date().addingTimeInterval(60 * 60)
  }
}
