import SwiftUI

struct MoodHeaderView: View {
    @Binding var selectedMood: Mood

    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text(selectedMood.label)
                    .font(.largeTitle)
                    .fontWeight(.bold)
                Text("MoodSync AI recommends music based on how you feel.")
                    .foregroundColor(.secondary)
                    .font(.subheadline)
            }
            Spacer()
            Text(selectedMood.emoji)
                .font(.system(size: 48))
        }
        .padding()
        .background(.ultraThinMaterial)
        .cornerRadius(20)
    }
}

struct RecommendationCard: View {
    let song: Song
    @State private var isAnimating = false

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Image(systemName: song.thumbnail)
                    .resizable()
                    .scaledToFit()
                    .frame(width: 60, height: 60)
                    .padding(14)
                    .background(Color.accentColor.opacity(0.12))
                    .cornerRadius(18)
                Spacer()
                VStack(alignment: .trailing) {
                    Text(song.duration)
                        .font(.caption)
                        .foregroundColor(.secondary)
                    Text(song.mood.emoji)
                        .font(.largeTitle)
                }
            }
            Text(song.title)
                .font(.title2)
                .fontWeight(.semibold)
                .lineLimit(2)
            Text(song.artist)
                .foregroundColor(.secondary)
                .lineLimit(1)
            HStack {
                Button(action: {}) {
                    Label("Play", systemImage: "play.fill")
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Color.accentColor)
                        .foregroundColor(.white)
                        .cornerRadius(14)
                }
                Button(action: {
                    withAnimation {
                        isAnimating.toggle()
                    }
                }) {
                    Image(systemName: isAnimating ? "heart.fill" : "heart")
                        .frame(width: 50, height: 50)
                        .background(Color.gray.opacity(0.1))
                        .cornerRadius(14)
                        .foregroundColor(isAnimating ? .red : .gray)
                }
            }
        }
        .padding()
        .background(.regularMaterial)
        .cornerRadius(24)
        .shadow(color: Color.black.opacity(0.08), radius: 16, x: 0, y: 12)
    }
}
