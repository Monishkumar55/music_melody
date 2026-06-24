import Foundation

enum Mood: String, CaseIterable, Identifiable {
    case happy, sad, angry, relaxed, energetic, stressed, romantic, neutral

    var id: String { rawValue }
    var label: String {
        switch self {
        case .happy: return "Happy"
        case .sad: return "Sad"
        case .angry: return "Angry"
        case .relaxed: return "Relaxed"
        case .energetic: return "Energetic"
        case .stressed: return "Stressed"
        case .romantic: return "Romantic"
        case .neutral: return "Neutral"
        }
    }

    var emoji: String {
        switch self {
        case .happy: return "😄"
        case .sad: return "😢"
        case .angry: return "😠"
        case .relaxed: return "😌"
        case .energetic: return "⚡"
        case .stressed: return "😰"
        case .romantic: return "💕"
        case .neutral: return "😐"
        }
    }

    static func fromText(_ text: String) -> Mood {
        let lower = text.lowercased()
        if lower.contains("happy") || lower.contains("joy") || lower.contains("excited") { return .happy }
        if lower.contains("sad") || lower.contains("down") || lower.contains("lonely") { return .sad }
        if lower.contains("angry") || lower.contains("mad") || lower.contains("furious") { return .angry }
        if lower.contains("relaxed") || lower.contains("calm") || lower.contains("peaceful") { return .relaxed }
        if lower.contains("energ") || lower.contains("pumped") || lower.contains("motivat") { return .energetic }
        if lower.contains("stress") || lower.contains("anxious") || lower.contains("worried") { return .stressed }
        if lower.contains("love") || lower.contains("romant") || lower.contains("date") { return .romantic }
        return .neutral
    }
}

struct Song: Identifiable {
    let id = UUID()
    let title: String
    let artist: String
    let mood: Mood
    let thumbnail: String
    let duration: String

    static func sample(for mood: Mood) -> Song {
        switch mood {
        case .happy:
            return Song(title: "Happy Vibes", artist: "MoodSync AI", mood: .happy, thumbnail: "music.note.list", duration: "3:20")
        case .sad:
            return Song(title: "Calm Reflections", artist: "MoodSync AI", mood: .sad, thumbnail: "music.note", duration: "4:05")
        case .angry:
            return Song(title: "Power Surge", artist: "MoodSync AI", mood: .angry, thumbnail: "flame.fill", duration: "2:58")
        case .relaxed:
            return Song(title: "Chill Waves", artist: "MoodSync AI", mood: .relaxed, thumbnail: "leaf.fill", duration: "5:12")
        case .energetic:
            return Song(title: "Burn Bright", artist: "MoodSync AI", mood: .energetic, thumbnail: "bolt.fill", duration: "3:40")
        case .stressed:
            return Song(title: "Ease Your Mind", artist: "MoodSync AI", mood: .stressed, thumbnail: "cloud.sun.fill", duration: "4:22")
        case .romantic:
            return Song(title: "Moonlit Romance", artist: "MoodSync AI", mood: .romantic, thumbnail: "heart.fill", duration: "3:58")
        case .neutral:
            return Song(title: "Everyday Flow", artist: "MoodSync AI", mood: .neutral, thumbnail: "circle.grid.2x2.fill", duration: "3:12")
        }
    }
}
