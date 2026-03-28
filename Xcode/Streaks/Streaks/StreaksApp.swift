import SwiftUI
import Combine
import Foundation

// MARK: - Models
public struct Habit: Identifiable {
    public var id = UUID()
    public var name: String
    public var streak: Int
    public var pattern: [Bool] // Last 10 days
    public var isCompletedToday: Bool = false
    
    public init(id: UUID = UUID(), name: String, streak: Int, pattern: [Bool], isCompletedToday: Bool = false) {
        self.id = id
        self.name = name
        self.streak = streak
        self.pattern = pattern
        self.isCompletedToday = isCompletedToday
    }
}

public class HabitStore: ObservableObject {
    @Published public var habits: [Habit] = [
        Habit(name: "Deep Work", streak: 12, pattern: [true, true, false, true, true, true, false, true, true, true], isCompletedToday: true),
        Habit(name: "Gym", streak: 8, pattern: [false, true, true, false, true, true, false, true, false, true], isCompletedToday: true),
        Habit(name: "Meditation", streak: 24, pattern: [true, true, true, true, true, false, true, true, true, false], isCompletedToday: false),
        Habit(name: "Reading", streak: 15, pattern: [true, false, true, true, false, true, true, true, false, true], isCompletedToday: true),
        Habit(name: "Hydration", streak: 30, pattern: [true, true, true, true, true, true, true, true, true, true], isCompletedToday: true)
    ]

    public init() {}

    public func toggleHabit(_ habit: Habit) {
        if let index = habits.firstIndex(where: { $0.id == habit.id }) {
            habits[index].isCompletedToday.toggle()
            if habits[index].isCompletedToday {
                habits[index].streak += 1
                if !habits[index].pattern.isEmpty {
                    habits[index].pattern[habits[index].pattern.count - 1] = true
                }
            } else {
                habits[index].streak -= 1
                if !habits[index].pattern.isEmpty {
                    habits[index].pattern[habits[index].pattern.count - 1] = false
                }
            }
        }
    }

    public func addHabit(name: String) {
        let newHabit = Habit(name: name, streak: 0, pattern: Array(repeating: false, count: 10))
        habits.append(newHabit)
    }
}

// MARK: - Components
public struct HabitWidgetView: View {
    public let habit: Habit
    public var onToggle: () -> Void
    
    public init(habit: Habit, onToggle: @escaping () -> Void) {
        self.habit = habit
        self.onToggle = onToggle
    }
    
    public var body: some View {
        HStack(spacing: 0) {
            Button(action: onToggle) {
                Image(systemName: habit.isCompletedToday ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 20))
                    .foregroundColor(habit.isCompletedToday ? .green : .secondary)
            }
            .buttonStyle(.plain)
            .padding(.trailing, 12)

            VStack(alignment: .leading, spacing: 2) {
                Text(habit.name)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundColor(.primary)
                Text("\(habit.streak) day streak")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            
            HStack(spacing: 4) {
                ForEach(0..<habit.pattern.count, id: \.self) { index in
                    RoundedRectangle(cornerRadius: 3)
                        .fill(habit.pattern[index] ? Color.green : Color.primary.opacity(0.1))
                        .frame(width: 12, height: 12)
                        .shadow(color: habit.pattern[index] ? Color.green.opacity(0.3) : .clear, radius: 2)
                }
            }
        }
        .padding(12)
        .background(.ultraThinMaterial)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Color.white.opacity(0.05), lineWidth: 0.5)
        )
    }
}

// MARK: - Main Views
struct HabitDashboardView: View {
    @ObservedObject var store: HabitStore
    @Binding var selectedTab: String?
    @State private var showingAddHabit = false

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                HStack(alignment: .top) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text("Welcome back, Alex")
                            .font(.system(size: 28, weight: .bold))
                        Text("You've completed \(store.habits.filter { $0.isCompletedToday }.count) of \(store.habits.count) habits today.")
                            .foregroundColor(.secondary)
                    }
                    Spacer()
                    Button(action: { showingAddHabit = true }) {
                        Image(systemName: "plus")
                            .font(.system(size: 16, weight: .bold))
                            .frame(width: 32, height: 32)
                            .background(Color.green)
                            .foregroundColor(.white)
                            .clipShape(Circle())
                    }
                    .buttonStyle(.plain)
                }
                .padding(.top, 20)

                VStack(alignment: .leading, spacing: 12) {
                    Text("MY HABITS")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.secondary)
                        .kerning(1.2)
                    
                    VStack(spacing: 8) {
                        ForEach(store.habits) { habit in
                            HabitWidgetView(habit: habit) {
                                withAnimation {
                                    store.toggleHabit(habit)
                                }
                            }
                            .onTapGesture {
                                selectedTab = "Stats"
                            }
                        }
                    }
                }
            }
            .padding(30)
        }
        .sheet(isPresented: $showingAddHabit) {
            AddHabitView(store: store)
        }
    }
}

struct AddHabitView: View {
    @Environment(\.dismiss) var dismiss
    @ObservedObject var store: HabitStore
    @State private var habitName = ""

    var body: some View {
        VStack(spacing: 24) {
            Text("New Habit")
                .font(.headline)
            
            TextField("What do you want to start?", text: $habitName)
                .textFieldStyle(.roundedBorder)
                .padding(.horizontal)
            
            HStack(spacing: 12) {
                Button("Cancel") { dismiss() }
                    .buttonStyle(.bordered)
                
                Button("Add Habit") {
                    if !habitName.isEmpty {
                        store.addHabit(name: habitName)
                        dismiss()
                    }
                }
                .buttonStyle(.borderedProminent)
                .tint(.green)
            }
        }
        .padding(24)
        .frame(width: 300)
    }
}

public struct HabitFlowMainView: View {
    @StateObject var store = HabitStore()
    @State private var selectedTab: String? = "Dashboard"
    
    public init() {}
    
    public var body: some View {
        NavigationSplitView {
            List(selection: $selectedTab) {
                Label("Dashboard", systemImage: "square.grid.2x2.fill")
                    .tag("Dashboard")
                Label("Statistics", systemImage: "chart.bar.fill")
                    .tag("Stats")
                Label("Badges", systemImage: "star.fill")
                    .tag("Badges")
            }
            .navigationTitle("HabitFlow")
        } detail: {
            if selectedTab == "Dashboard" {
                HabitDashboardView(store: store, selectedTab: $selectedTab)
            } else if selectedTab == "Stats" {
                HabitStatisticsView(store: store)
            } else {
                Text("Coming Soon")
                    .foregroundColor(.secondary)
            }
        }
        .frame(minWidth: 800, minHeight: 600)
    }
}

struct HabitStatisticsView: View {
    @State private var selectedMonth = Date()
    @ObservedObject var store: HabitStore
    
    var body: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Statistics")
                    .font(.title2).bold()
                Spacer()
                DatePicker("", selection: $selectedMonth, displayedComponents: .date)
                    .labelsHidden()
                    .datePickerStyle(.field)
            }
            .padding(24)
            
            ScrollView {
                VStack(spacing: 20) {
                    ForEach(store.habits) { habit in
                        VStack(alignment: .leading, spacing: 16) {
                            HStack {
                                Text(habit.name)
                                    .font(.headline)
                                Spacer()
                                Text("\(habit.streak)").font(.title2).bold().foregroundColor(.green)
                                Text("DAYS").font(.caption).foregroundColor(.secondary)
                            }
                            
                            // Mock Full Month Grid
                            let columns = Array(repeating: GridItem(.fixed(16), spacing: 6), count: 7)
                            LazyVGrid(columns: columns, alignment: .leading, spacing: 6) {
                                ForEach(0..<31, id: \.self) { i in
                                    RoundedRectangle(cornerRadius: 3)
                                        .fill(Double.random(in: 0...1) > 0.4 ? Color.green.opacity(0.8) : Color.white.opacity(0.05))
                                        .frame(height: 16)
                                }
                            }
                        }
                        .padding(20)
                        .background(.white.opacity(0.03))
                        .cornerRadius(20)
