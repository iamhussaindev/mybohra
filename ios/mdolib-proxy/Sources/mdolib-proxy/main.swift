import Foundation
import Network
import MDOLibBridge

let port = UInt16(ProcessInfo.processInfo.environment["PORT"] ?? "8787") ?? 8787

func httpResponse(status: String, body: Data) -> Data {
  var response = "HTTP/1.1 \(status)\r\n"
  response += "Content-Type: application/json\r\n"
  response += "Access-Control-Allow-Origin: *\r\n"
  response += "Access-Control-Allow-Methods: POST, OPTIONS\r\n"
  response += "Access-Control-Allow-Headers: Content-Type\r\n"
  response += "Content-Length: \(body.count)\r\n"
  response += "Connection: close\r\n\r\n"
  var data = Data(response.utf8)
  data.append(body)
  return data
}

func handleRequest(_ request: Data) -> Data {
  let text = String(decoding: request, as: UTF8.self)
  if text.hasPrefix("OPTIONS") {
    return httpResponse(status: "204 No Content", body: Data())
  }

  guard text.contains("POST"),
        let bodyStart = text.range(of: "\r\n\r\n")?.upperBound
  else {
    return httpResponse(status: "405 Method Not Allowed", body: Data("{\"error\":\"POST only\"}".utf8))
  }

  let bodyText = String(text[bodyStart...])
  guard let bodyData = bodyText.data(using: .utf8),
        let json = try? JSONSerialization.jsonObject(with: bodyData) as? [String: Any],
        let latitude = json["latitude"] as? Double,
        let longitude = json["longitude"] as? Double
  else {
    return httpResponse(status: "400 Bad Request", body: Data("{\"error\":\"latitude and longitude required\"}".utf8))
  }

  let dateISO = (json["date"] as? String) ?? ISO8601DateFormatter().string(from: Date())
  let payload = MDOLibBridge.prayerTimesJSON(latitude: latitude, longitude: longitude, dateISO: dateISO)
  let out = (try? JSONSerialization.data(withJSONObject: payload)) ?? Data()
  return httpResponse(status: "200 OK", body: out)
}

let listener = try! NWListener(using: .tcp, on: NWEndpoint.Port(rawValue: port)!)
print("MDOLib proxy listening on :\(port)")

listener.newConnectionHandler = { connection in
  connection.start(queue: .global())
  connection.receive(minimumIncompleteLength: 1, maximumLength: 65536) { data, _, _, _ in
    guard let data else { return }
    let response = handleRequest(data)
    connection.send(content: response, completion: .contentProcessed { _ in
      connection.cancel()
    })
  }
}

listener.start(queue: .main)
dispatchMain()
