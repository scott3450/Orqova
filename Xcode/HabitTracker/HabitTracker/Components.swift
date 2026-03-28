import SwiftUI

// 1. GitHub-style Yearly Heatmap
struct YearlyHeatmapView: View {
    let habit: Habit
    let color: Color
    
    private let calendar = Calendar.current
    private let daysInYear = 365
    
    // Calculate weeks for the grid
    private var weeks: [[Date?]] {
        let today = calendar.startOfDay(for: Date())
        var dates: [Date] = []
        for i in 0..<daysInYear {
            if let date = calendar.date(byAdding: .day, value: -i, to: today) {
                dates.append(date)
            }
        }
        dates.reverse() // Oldest to newest
        
        // Group by weeks
        var result: [[Date?]] = []
        var currentWeek: [Date?] = Array(repeating: nil, count: 7)
        
        for date in dates {
            let weekday = calendar.component(.weekday, from: date) - 1 // 0 = Sunday
            currentWeek[weekday] = date
            
            if weekday == 6 { // Saturday
                result.append(currentWeek)
                currentWeek = Array(repeating: nil, count: 7)
            }
        }
        if currentWeek.contains(where: { $0 != nil }) {
            result.append(currentWeek)
        }
        return result
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("\(habit.yearlyCompletions()) contributions in the last year")
                .font(.subheadline)
                .foregroundColor(.secondary)
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(alignment: .top, spacing: 3) {
                    // Day labels
                    VStack(alignment: .leading, spacing: 3) {
                        Spacer().frame(height: 12) // Alignment with month labels
                        Text("Mon").font(.system(size: 8)).foregroundColor(.secondary)
                        Spacer().frame(height: 10)
                        Text("Wed").font(.system(size: 8)).foregroundColor(.secondary)
                        Spacer().frame(height: 10)
                        Text("Fri").font(.system(size: 8)).foregroundColor(.secondary)
                    }
                    .padding(.trailing, 4)
                    
                    ForEach(weeks.indices, id: \.self) { weekIndex in
                        VStack(spacing: 3) {
                            ForEach(0..<7) { dayIndex in
                                if let date = weeks[weekIndex][dayIndex] {
                                    RoundedRectangle(cornerRadius: 2)
                                        .fill(habit.isCompleted(on: date) ? color : Color.primary.opacity(0.05))
                                        .frame(width: 10, height: 10)
                                        .help(date.formatted(date: .abbreviated, time: .omitted))
                                } else {
                                    Color.clear.frame(width: 10, height: 10)
                                }
                            }
                        }
                    }
                }
                .padding(.bottom, 10)
            }
        }
        .padding()
        .background(Color.secondary.opacity(0.05))
        .cornerRadius(12)
    }
}

// 2. The 30-Day Minimalist Grid (Still used in list or small previews)
struct ProgressGridView: View {
    let habit: Habit
    var color: Color
    
    private var last30Days: [Date] {
        (0..<30).reversed().compactMap { i in
            Calendar.current.date(byAdding: .day, value: -i, to: Date())
        }
    }
    
    var body: some View {
        HStack(spacing: 4) {
            ForEach(last30Days, id: \.self) { date in
                Circle()
                    .fill(habit.isCompleted(on: date) ? color : color.opacity(0.15))
                    .frame(width: 8, height: 8)
            }
        }
    }
}

// 3. Updated Color Palette (Vibrant iOS Style)
public enum HabitPalette {
    static let colors: [String] = [
        "#5856D6", // Purple
        "#007AFF", // Blue
        "#34C759", // Green
        "#FF9500", // Orange
        "#FF2D55", // Pink
        "#AF52DE"  // Violet
    ]
    
    static func color(from hex: String) -> Color {
        return Color(hex: hex) ?? .gray
    }
}

extension Color {
    init?(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3: (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6: (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        default: (a, r, g, b) = (1, 1, 1, 0)
        }
        self.init(.sRGB, red: Double(r) / 255, green: Double(g) / 255, blue:  Double(b) / 255, opacity: Double(a) / 255)
    }
}
