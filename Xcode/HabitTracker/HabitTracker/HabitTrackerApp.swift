//
//  HabitTrackerApp.swift
//  HabitTracker
//
//  Created by Mac on 23.03.2026.
//

import SwiftUI
import SwiftData
@main
struct HabitTrackerApp: App {
    var body: some Scene {
        WindowGroup {
            ContentView()
                .modelContainer(SharedModelContainer.container) // HabitData içindeki container
        }
    }
}
