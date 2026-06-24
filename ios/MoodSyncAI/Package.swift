// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "MoodSyncAI",
    platforms: [
        .iOS(.v17)
    ],
    products: [
        .executable(name: "MoodSyncAI", targets: ["MoodSyncAIApp"])
    ],
    dependencies: [],
    targets: [
        .executableTarget(
            name: "MoodSyncAIApp",
            dependencies: [],
            path: "Sources/MoodSyncAIApp"
        )
    ]
)
