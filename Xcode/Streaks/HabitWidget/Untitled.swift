import WidgetKit
import SwiftUI

// MARK: - Widget Provider
struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), habits: [
            Habit(name: "Deep Work", streak: 12, pattern: [true, true, false, true, true, true, false, true, true, true], isCompletedToday: true),
            Habit(name: "Gym", streak: 8, pattern: [false, true, true, false, true, true, false, true, false, true], isCompletedToday: false)
        ])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let entry = SimpleEntry(date: Date(), habits: [
            Habit(name: "Deep Work", streak: 12, pattern: [true, true, false, true, true, true, false, true, true, true], isCompletedToday: true),
            Habit(name: "Gym", streak: 8, pattern: [false, true, true, false, true, true, false, true, false, true], isCompletedToday: false)
        ])
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> ()) {
        let currentDate = Date()
        let entry = SimpleEntry(date: currentDate, habits: [
            Habit(name: "Deep Work", streak: 12, pattern: [true, true, false, true, true, true, false, true, true, true], isCompletedToday: true),
            Habit(name: "Gym", streak: 8, pattern: [false, true, true, false, true, true, false, true, false, true], isCompletedToday: false),
            Habit(name: "Meditation", streak: 24, pattern: [true, true, true, true, true, false, true, true, true, false], isCompletedToday: false)
        ])

        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

// MARK: - Widget Entry
struct SimpleEntry: TimelineEntry {
    let date: Date
    let habits: [Habit]
}

// MARK: - Widget View
struct HabitWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("HabitFlow")
                .font(.system(size: 10, weight: .bold))
                .foregroundColor(.secondary)
                .kerning(1.2)
            
            VStack(spacing: 8) {
                // Showing top 3 habits in the widget
                ForEach(entry.habits.prefix(3)) { habit in
                    HabitWidgetView(habit: habit) {
                        // Widgets are interactable via App Intents in iOS 17+,
                        // but for now, we'll keep it as a display-only widget.
                    }
                }
            }
        }
        .containerBackground(.ultraThinMaterial, for: .widget)
    }
}

// MARK: - Widget Configuration
@main
struct HabitWidget: Widget {
    let kind: String = "HabitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HabitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Habit Tracker")
        .description("Your streaks at a glance.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}
