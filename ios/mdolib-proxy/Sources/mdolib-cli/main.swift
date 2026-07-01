import Foundation
import MDOLibBridge

guard CommandLine.arguments.count >= 4 else {
  fputs("Usage: mdolib-cli <latitude> <longitude> <iso-date>\n", stderr)
  exit(1)
}

let latitude = Double(CommandLine.arguments[1])!
let longitude = Double(CommandLine.arguments[2])!
let dateISO = CommandLine.arguments[3]

let payload = MDOLibBridge.prayerTimesJSON(latitude: latitude, longitude: longitude, dateISO: dateISO)
let data = try JSONSerialization.data(withJSONObject: payload, options: [.sortedKeys])
FileHandle.standardOutput.write(data)
print()
