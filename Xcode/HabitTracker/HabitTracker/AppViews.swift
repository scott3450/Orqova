import SwiftUI
import SwiftData
import WidgetKit

struct MainView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Habit.createdAt, order: .reverse) private var habits: [Habit]
    @State private var selectedHabit: Habit?
    @State private var showingAddHabit = false
    
    var body: some View {
        NavigationSplitView {
            // Sidebar: List of Habits with Streaks
            List(selection: $selectedHabit) {
                Section("Your Habits") {
                    ForEach(habits) { habit in
                        NavigationLink(value: habit) {
                            HStack {
                                Circle()
                                    .fill(HabitPalette.color(from: habit.colorHex))
                                    .frame(width: 10, height: 10)
                                
                                VStack(alignment: .leading) {
                                    Text(habit.name)
                                        .font(.headline)
                                    
                                    if habit.currentStreak() > 0 {
                                        Text("\(habit.currentStreak()) day streak 🔥")
                                            .font(.caption)
                                            .foregroundColor(.orange)
                                    } else {
                                        Text("No streak yet")
                                            .font(.caption)
                                            .foregroundColor(.secondary)
                                    }
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .onDelete(perform: deleteHabits)
                }
            }
            .navigationTitle("HabitTracker")
            .toolbar {
                ToolbarItem {
                    Button(action: { showingAddHabit = true }) {
                        Label("Add Habit", systemImage: "plus")
                    }
                }
            }
        } detail: {
            if let habit = selectedHabit {
                HabitDetailView(habit: habit)
            } else {
                VStack(spacing: 20) {
                    Image(systemName: "square.grid.3x3.topleft.filled")
                        .font(.system(size: 80))
                        .foregroundColor(.secondary.opacity(0.2))
                    Text("Select a habit to see your progress")
                        .font(.title3)
                        .foregroundColor(.secondary)
                }
            }
        }
        .sheet(isPresented: $showingAddHabit) {
            AddHabitView()
        }
    }
    
    private func deleteHabits(offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(habits[index])
        }
        WidgetCenter.shared.reloadAllTimelines()
    }
}

struct HabitDetailView: View {
    let habit: Habit
    @Environment(\.modelContext) private var modelContext
    
    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 32) {
                // Header Area
                HStack(alignment: .firstTextBaseline) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(habit.name)
                            .font(.system(size: 48, weight: .bold, design: .rounded))
                        
                        Text("Started on \(habit.createdAt.formatted(date: .long, time: .omitted))")
                            .font(.subheadline)
                            .foregroundColor(.secondary)
                    }
                    
                    Spacer()
                    
                    Button(action: { logCompletion() }) {
                        HStack {
                            Image(systemName: habit.isCompleted(on: Date()) ? "checkmark.circle.fill" : "circle")
                            Text(habit.isCompleted(on: Date()) ? "Completed Today" : "Log Completion")
                        }
                        .font(.headline)
                        .padding(.horizontal, 24)
                        .padding(.vertical, 12)
                        .background(habit.isCompleted(on: Date()) ? Color.green : HabitPalette.color(from: habit.colorHex))
                        .foregroundColor(.white)
                        .cornerRadius(28)
                    }
                    .buttonStyle(.plain)
                }
                
                // Yearly Contribution Heatmap (GitHub Style)
                VStack(alignment: .leading, spacing: 12) {
                    Text("Activity Heatmap")
                        .font(.title2.bold())
                    
                    YearlyHeatmapView(habit: habit, color: HabitPalette.color(from: habit.colorHex))
                }
                
                // Monthly Stats Summary
                VStack(alignment: .leading, spacing: 16) {
                    Text("Summary")
                        .font(.title2.bold())
                    
                    HStack(spacing: 20) {
                        DetailStatCard(
                            label: "Total Completions",
                            value: "\(habit.logs.count)",
                            icon: "number.circle.fill",
                            color: .blue
                        )
                        
                        DetailStatCard(
                            label: "Current Streak",
                            value: "\(habit.currentStreak()) Days",
                            icon: "flame.fill",
                            color: .orange
                        )
                        
                        DetailStatCard(
                            label: "Success Rate",
                            value: String(format: "%.0f%%", habit.last30DaysCompletionRate() * 100),
                            icon: "chart.bar.fill",
                            color: .green
                        )
                    }
                }
            }
            .padding(48)
        }
    }
    
    private func logCompletion() {
        let today = Date()
        if habit.isCompleted(on: today) {
            habit.logs.removeAll { Calendar.current.isDate($0, inSameDayAs: today) }
        } else {
            habit.logs.append(today)
        }
        WidgetCenter.shared.reloadAllTimelines()
    }
}

struct DetailStatCard: View {
    let label: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Image(systemName: icon)
                    .foregroundColor(color)
                Text(label)
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            Text(value)
                .font(.title2.bold())
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(Color.secondary.opacity(0.1))
        .cornerRadius(16)
    }
}

// AddHabitView and other supporting views (StatCard etc. if needed) stay similar
struct AddHabitView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.dismiss) private var dismiss
    
    @State private var name = ""
    @State private var selectedColorHex = HabitPalette.colors.first!
    
    var body: some View {
        VStack(spacing: 24) {
            Text("Create New Habit")
                .font(.title2.bold())
            
            TextField("What's your new habit?", text: $name)
                .textFieldStyle(.roundedBorder)
                .font(.title3)
            
            VStack(alignment: .leading, spacing: 12) {
                Text("Select Theme Color")
                    .font(.subheadline)
                    .foregroundColor(.secondary)
                
                HStack(spacing: 16) {
                    ForEach(HabitPalette.colors, id: \.self) { hex in
                        Circle()
                            .fill(HabitPalette.color(from: hex))
                            .frame(width: 36, height: 36)
                            .overlay(
                                Circle()
                                    .stroke(Color.primary, lineWidth: selectedColorHex == hex ? 3 : 0)
                            )
                            .onTapGesture {
                                selectedColorHex = hex
                            }
                    }
                }
            }
            
            HStack {
                Button("Discard") { dismiss() }
                    .buttonStyle(.plain)
                    .foregroundColor(.secondary)
                
                Spacer()
                
                Button("Add Habit") {
                    let newHabit = Habit(name: name, colorHex: selectedColorHex)
                    modelContext.insert(newHabit)
                    WidgetCenter.shared.reloadAllTimelines()
                    dismiss()
                }
                .buttonStyle(.borderedProminent)
                .controlSize(.large)
                .disabled(name.isEmpty)
            }
        }
        .frame(width: 350, height: 400)
        .padding(32)
    }
}
