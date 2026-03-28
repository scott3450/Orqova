import WidgetKit
import SwiftUI
import SwiftData

struct Provider: TimelineProvider {
    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(date: Date(), habits: [])
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
        let habits = fetchHabits()
        let entry = SimpleEntry(date: Date(), habits: habits)
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
        let habits = fetchHabits()
        let entry = SimpleEntry(date: Date(), habits: habits)
        
        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
    
    // Fetch from shared container (MUST use exactly the same App Group logic)
    private func fetchHabits() -> [Habit] {
        let container = SharedModelContainer.container
        let context = ModelContext(container)
        let descriptor = FetchDescriptor<Habit>(sortBy: [SortDescriptor(\.createdAt, order: .reverse)])
        
        do {
            let habits = try context.fetch(descriptor)
            print("Widget: Fetched \(habits.count) habits")
            return habits
        } catch {
            print("Widget: Fetch error - \(error)")
            return []
        }
    }
}

struct SimpleEntry: TimelineEntry {
    let date: Date
    let habits: [Habit]
}

struct HabitWidgetEntryView : View {
    var entry: Provider.Entry

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Habits")
                .font(.headline)
            
            if entry.habits.isEmpty {
                Text("No data")
                    .font(.caption)
                    .foregroundColor(.secondary)
            } else {
                ForEach(entry.habits.prefix(3)) { habit in
                    HStack {
                        Circle()
                            .fill(HabitPalette.color(from: habit.colorHex))
                            .frame(width: 8, height: 8)
                        Text(habit.name)
                            .font(.caption)
                            .lineLimit(1)
                        Spacer()
                        Text("\(habit.weeklyCount())/7")
                            .font(.system(size: 10, weight: .bold))
                            .foregroundColor(.secondary)
                    }
                }
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }
}

@main
struct HabitWidget: Widget {
    let kind: String = "HabitWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: Provider()) { entry in
            HabitWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("Habit Tracker")
        .description("Track your habits.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
