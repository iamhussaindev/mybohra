// swift-tools-version:5.9
import PackageDescription

let package = Package(
  name: "mdolib-proxy",
  platforms: [.macOS(.v12)],
  products: [
    .executable(name: "mdolib-cli", targets: ["mdolib-cli"]),
    .executable(name: "mdolib-proxy", targets: ["mdolib-proxy"]),
  ],
  dependencies: [],
  targets: [
    .binaryTarget(
      name: "MDOLib",
      path: "../MDOLib.xcframework"
    ),
    .target(
      name: "MDOLibBridge",
      dependencies: ["MDOLib"],
      path: "Sources/MDOLibBridge"
    ),
    .executableTarget(
      name: "mdolib-cli",
      dependencies: ["MDOLibBridge"],
      path: "Sources/mdolib-cli"
    ),
    .executableTarget(
      name: "mdolib-proxy",
      dependencies: ["MDOLibBridge"],
      path: "Sources/mdolib-proxy"
    ),
  ]
)
