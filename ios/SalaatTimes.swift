import MDOLib
import Foundation

@objc(SalaatTimes)
class SalaatTimes: NSObject {
  
  private var count = 0;
  
  @objc
  func getPrayerTimes(_ latitude: Double, longitude: Double, date: String, callback: RCTResponseSenderBlock ) {
    
    let dateFormatter = ISO8601DateFormatter()
    dateFormatter.formatOptions = [.withFractionalSeconds, .withInternetDateTime]
    
     if let forDate = dateFormatter.date(from: date) {
      let outDict: Dictionary = MDOLib.roundedSalaatArray(for: forDate, lat: latitude, lon: longitude, altitude: 0.0)
      var prayerTimes = [String: String]()
    
      for (key, value) in outDict {
        if let date = value as? Date {
            prayerTimes[key as! String] = formatDate(date: date)
        }
      }
      callback([prayerTimes])
                 
              } else {
                  // Handle the case where the date string is invalid
                  // For example, you can return an empty dictionary or throw an error
                callback([]) // or throw an error
              }
    
      
  } 
  
  @objc
  static func requiresMainQueueSetup()-> Bool {
    return true;
  }
  
  func constantsToExport() -> [String: Any]! {
    return ["initialCount":0]
  }
  
  private func formatDate(date: Date) -> String {
     let formatter = DateFormatter()
     formatter.dateFormat = "HH:mm" // Adjust format as per your requirement
     return formatter.string(from: date)
  }
  
}
