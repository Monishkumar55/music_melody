import SwiftUI

struct ContentView: View {
    @State private var selectedMood: Mood = .neutral
    @State private var textInput: String = ""
    @State private var recommendedSong: Song? = nil
    @State private var isLoading = false
    @State private var errorMessage: String? = nil

    var body: some View {
        NavigationStack {
            VStack(spacing: 24) {
                MoodHeaderView(selectedMood: $selectedMood)

                TextField("Describe your mood...", text: $textInput)
                    .textFieldStyle(.roundedBorder)
                    .padding(.horizontal)

                Button(action: analyzeMood) {
                    if isLoading {
                        ProgressView()
                            .frame(maxWidth: .infinity)
                            .padding()
                    } else {
                        Text("Analyze Mood")
                            .fontWeight(.semibold)
                            .frame(maxWidth: .infinity)
                            .padding()
                    }
                }
                .background(Color.accentColor)
                .foregroundColor(.white)
                .cornerRadius(12)
                .padding(.horizontal)
                .disabled(isLoading || textInput.trimmingCharacters(in: .whitespaces).isEmpty)

                if let error = errorMessage {
                    Text(error)
                        .foregroundColor(.red)
                        .font(.caption)
                        .padding(.horizontal)
                }

                if let song = recommendedSong {
                    RecommendationCard(song: song)
                        .transition(.opacity.combined(with: .move(edge: .bottom)))
                        .padding(.horizontal)
                }

                Spacer()
            }
            .navigationTitle("MoodSync AI")
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button(action: toggleMood) {
                        Image(systemName: "wand.and.stars")
                    }
                    .disabled(isLoading)
                }
            }
        }
    }

    private func analyzeMood() {
        // Validate input
        let trimmedInput = textInput.trimmingCharacters(in: .whitespaces)
        if trimmedInput.isEmpty {
            errorMessage = "Please enter how you're feeling"
            return
        }
        if trimmedInput.count > 10000 {
            errorMessage = "Text is too long (max 10000 characters)"
            return
        }
        
        errorMessage = nil
        isLoading = true
        
        let mood = Mood.fromText(trimmedInput)
        selectedMood = mood
        recommendedSong = Song.sample(for: mood)
        
        isLoading = false
    }

    private func toggleMood() {
        selectedMood = Mood.allCases.randomElement() ?? .neutral
        recommendedSong = Song.sample(for: selectedMood)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
