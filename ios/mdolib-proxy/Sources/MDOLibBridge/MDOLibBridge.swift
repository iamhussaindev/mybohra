import Foundation
import MDOLib

public enum MDOLibBridge {
  public static func prayerTimesJSON(latitude: Double, longitude: Double, dateISO: String) -> [String: Any] {
    let formatter = ISO8601DateFormatter()
    formatter.formatOptions = [.withFractionalSeconds, .withInternetDateTime, .withFullDate]
    let forDate = formatter.date(from: dateISO) ?? ISO8601DateFormatter().date(from: dateISO) ?? Date()

    let outDict =
      MDOLib.roundedSalaatArray(for: forDate, lat: latitude, lon: longitude, altitude: 0.0) ?? [:]
    var times: [String: String] = [:]
    let hhmm = DateFormatter()
    hhmm.dateFormat = "HH:mm"

    for (key, value) in outDict {
      if let date = value as? Date, let keyStr = key as? String {
        times[keyStr] = hhmm.string(from: date)
      }
    }

    return [
      "times": times,
      "source": "mdolib",
      "latitude": latitude,
      "longitude": longitude,
      "date": forDate.ISO8601Format(),
    ]
  }
}
