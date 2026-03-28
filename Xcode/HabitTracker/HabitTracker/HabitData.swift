import Foundation
import SwiftData

@Model
final class Habit {
    var name: String
    var colorHex: String
    var logs: [Date]
    var createdAt: Date
    
    init(name: String, colorHex: String) {
        self.name = name
        self.colorHex = colorHex
        self.logs = []
        self.createdAt = Date()
    }
    
    func isCompleted(on date: Date) -> Bool {
        return logs.contains { Calendar.current.isDate($0, inSameDayAs: date) }
    }
    
    // Streak Calculation
    func currentStreak() -> Int {
        let calendar = Calendar.current
        var streak = 0
        var checkDate = calendar.startOfDay(for: Date())
        
        // If not completed today, check from yesterday
        if !isCompleted(on: checkDate) {
            checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate)!
        }
        
        while isCompleted(on: checkDate) {
            streak += 1
            checkDate = calendar.date(byAdding: .day, value: -1, to: checkDate)!
        }
        
        return streak
    }
    
    // Yearly Stats
    func yearlyCompletions() -> Int {
        let oneYearAgo = Calendar.current.date(byAdding: .year, value: -1, to: Date())!
        return logs.filter { $0 >= oneYearAgo }.count
    }
    
    func completionsIn(month: Int, year: Int) -> Int {
        let calendar = Calendar.current
        return logs.filter {
            let components = calendar.dateComponents([.month, .year], from: $0)
            return components.month == month && components.year == year
        }.count
    }
    
    func weeklyCount() -> Int {
        let calendar = Calendar.current
        let today = Date()
        guard let startOfWeek = calendar.date(from: calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: today)) else { return 0 }
        return logs.filter { $0 >= startOfWeek }.count
    }
    
    func last30DaysCompletionRate() -> Double {
        let thirtyDaysAgo = Calendar.current.date(byAdding: .day, value: -30, to: Date())!
        let count = logs.filter { $0 >= thirtyDaysAgo }.count
        return Double(count) / 30.0
    }
}

// Connectivity Logic (Shared across targets)
public enum SharedModelContainer {
    public static let appGroupId = "group.com.user.habittracker"
    
    public static var container: ModelContainer = {
        let schema = Schema([Habit.self])
        let modelConfiguration: ModelConfiguration
        
        if let sharedURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: appGroupId) {
            let url = sharedURL.appendingPathComponent("HabitTracker.sqlite")
            modelConfiguration = ModelConfiguration(schema: schema, url: url)
        } else {
            modelConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        }
        
        do {
            return try ModelContainer(for: schema, configurations: [modelConfiguration])
        } catch {
            return try! ModelContainer(for: schema, configurations: [ModelConfiguration(isStoredInMemoryOnly: true)])
        }
    }()
}
