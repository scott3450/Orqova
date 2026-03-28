// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: orange; icon-glyph: calendar-check;

/*
 * HABIT TRACKER WIDGET FOR SCRIPTABLE
 * 
 * Instructions:
 * 1. Install Scriptable from the App Store.
 * 2. Add a new script and copy-paste this code.
 * 3. Add a medium Scriptable widget to your home screen and select this script.
 * 4. Tap the widget any time to log your habits!
 */

// === CONFIGURATION ===
const CONFIG = {
  // Themes: "dark", "light", "warm", "cool", "paper"
  theme: "dark", 
  
  // Default habits in case nothing is saved
  habits: [],
  
  // Daily reminder notification settings
  reminder: {
    enabled: true,
    hour: 20, // 8 PM
    minute: 0
  }
};

// === THEMES ===
const THEMES = {
  dark: { bg: "#131313", text: "#737373", highlight: "#a3a3a3", emptyDot: "#262626", title: "#525252", marker: "#ef4444" },
  light: { bg: "#ffffff", text: "#a3a3a3", highlight: "#404040", emptyDot: "#f5f5f5", title: "#d4d4d4", marker: "#ef4444" },
  warm: { bg: "#faf1e4", text: "#b4a594", highlight: "#4a3f35", emptyDot: "#e8dcce", title: "#d1c4b6", marker: "#e05b43" },
  cool: { bg: "#f0f4f8", text: "#9fb3c8", highlight: "#243b53", emptyDot: "#d9e2ec", title: "#bcccdc", marker: "#e11d48" },
  paper: { bg: "#f4f0eb", text: "#a39c94", highlight: "#3d3935", emptyDot: "#e0d8cf", title: "#c9c2ba", marker: "#d946ef" }
};

// === STORAGE ===
const fm = FileManager.local();
const dir = fm.joinPath(fm.documentsDirectory(), "HabitTrackerWidget");
if (!fm.fileExists(dir)) fm.createDirectory(dir);
const dataPath = fm.joinPath(dir, "data.json");

function loadData() {
  let storedData = {};
  if (fm.fileExists(dataPath)) {
    try {
      fm.downloadFileFromiCloud(dataPath);
      const fileData = fm.readString(dataPath);
      storedData = JSON.parse(fileData);
    } catch (e) {
      console.error(e);
    }
  }
  
  // Initialize with CONFIG habits if user hasn't created any yet
  if (!storedData.habits || storedData.habits.length === 0) {
    storedData.habits = CONFIG.habits;
  }
  
  return storedData;
}

function saveData(data) {
  fm.writeString(dataPath, JSON.stringify(data));
}

// === REMINDERS ===
async function setupReminders(data) {
  const isEnabled = data.reminderEnabled !== undefined ? data.reminderEnabled : CONFIG.reminder.enabled;
  if (!isEnabled) {
    Notification.removeAllPending();
    return;
  }
  const pending = await Notification.allPending();
  if (pending.length > 0) return; // Already setup

  let notif = new Notification();
  notif.title = "Habit Tracker";
  notif.body = "Tap to log your habits for today!";
  
  let date = new Date();
  date.setHours(CONFIG.reminder.hour, CONFIG.reminder.minute, 0);
  
  if (date.getTime() < Date.now()) {
    date.setDate(date.getDate() + 1);
  }
  
  notif.setDeliveryDate(date);
  notif.schedule();
}

// === LOGGING UI (RUNS IN APP) ===
async function presentMenu(data) {
  const table = new UITable();
  table.showSeparators = true;
  
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const dateKey = `${year}-${month}-${now.getDate()}`;
  
  if (!data[dateKey]) data[dateKey] = {};

  const header = new UITableRow();
  header.isHeader = true;
  const headerCell = header.addText("Today");
  headerCell.titleColor = new Color("#8e8e93");
  headerCell.titleFont = Font.systemFont(13);
  table.addRow(header);
  
  for (let habit of data.habits) {
    const row = new UITableRow();
    row.dismissOnSelect = false;
    const isDone = !!data[dateKey][habit.id];
    
    // SF Symbol or text circles matching the reference image styling
    const icon = isDone ? "◉" : "◯";
    const cell = row.addText(`${icon}   ${habit.label}`);
    
    // Color the text based on habit color to match reference
    cell.titleColor = new Color(habit.color);
    cell.titleFont = Font.boldSystemFont(18);
    
    row.onSelect = async (idx) => {
      data[dateKey][habit.id] = !data[dateKey][habit.id];
      saveData(data);
      presentMenu(data);
    };
    table.addRow(row);
  }
  
  const addRow = new UITableRow();
  const addCell = addRow.addText("➕ Yeni Alışkanlık Ekle (New Habit)");
  addCell.titleColor = new Color("#0a84ff");
  addCell.titleFont = Font.systemFont(15);
  addRow.onSelect = async () => {
    let alert = new Alert();
    alert.title = "Yeni Alışkanlık Ekle";
    alert.addTextField("Alışkanlık İsmi (örn: read)", "");
    alert.addAction("Devam (Pick Color)");
    alert.addCancelAction("İptal");
    
    if (await alert.presentAlert() === 0) {
      const name = alert.textFieldValue(0).trim();
      if (name) {
        let colorAlert = new Alert();
        colorAlert.title = "Renk Seç (Pick Color)";
        const PALETTE = [
          { name: "Sarı (Yellow)", hex: "#FDE68A" },
          { name: "Açık Yeşil (Light Green)", hex: "#D9F99D" },
          { name: "Mavi (Blue)", hex: "#BAE6FD" },
          { name: "Kırmızı (Red)", hex: "#FECACA" },
          { name: "Mor (Purple)", hex: "#E9D5FF" },
          { name: "Pembe (Pink)", hex: "#FBCFE8" }
        ];
        for (let p of PALETTE) { colorAlert.addAction(p.name); }
        colorAlert.addCancelAction("İptal");
        
        const colorIdx = await colorAlert.presentSheet();
        if (colorIdx !== -1) {
          data.habits.push({
            id: name.toLowerCase().replace(/[^a-z0-9]/g, "-"),
            label: name,
            color: PALETTE[colorIdx].hex
          });
          saveData(data);
          presentMenu(data);
        }
      }
    }
  };
  table.addRow(addRow);
  
  const editRow = new UITableRow();
  const editCell = editRow.addText("🔧 Alışkanlıkları Düzenle (Edit/Sort Habits)");
  editCell.titleColor = new Color("#ff9f0a");
  editCell.titleFont = Font.systemFont(15);
  editRow.onSelect = async () => {
    if (data.habits.length === 0) return;
    let editAlert = new Alert();
    editAlert.title = "Düzenle (Edit / Sort)";
    for (let h of data.habits) {
      editAlert.addAction(h.label);
    }
    editAlert.addCancelAction("İptal");
    let hIdx = await editAlert.presentSheet();
    if (hIdx !== -1) {
      let actionAlert = new Alert();
      actionAlert.title = data.habits[hIdx].label;
      actionAlert.addAction("Yukarı Taşı ⬆️");
      actionAlert.addAction("Aşağı Taşı ⬇️");
      actionAlert.addDestructiveAction("Sil 🗑️");
      actionAlert.addCancelAction("İptal");
      let aIdx = await actionAlert.presentSheet();
      if (aIdx === 0 && hIdx > 0) {
        let temp = data.habits[hIdx];
        data.habits[hIdx] = data.habits[hIdx-1];
        data.habits[hIdx-1] = temp;
      } else if (aIdx === 1 && hIdx < data.habits.length - 1) {
        let temp = data.habits[hIdx];
        data.habits[hIdx] = data.habits[hIdx+1];
        data.habits[hIdx+1] = temp;
      } else if (aIdx === 2) {
        data.habits.splice(hIdx, 1);
      }
      if (aIdx !== -1) {
        saveData(data);
        presentMenu(data);
      }
    }
  };
  table.addRow(editRow);
  
  const settingsRow = new UITableRow();
  const settingsCell = settingsRow.addText("🎨 Tema ve Ayarlar (Theme & Settings)");
  settingsCell.titleColor = new Color("#bf5af2");
  settingsCell.titleFont = Font.systemFont(15);
  settingsRow.onSelect = async () => {
    let sAlert = new Alert();
    sAlert.title = "Ayarlar (Settings)";
    sAlert.addAction("Tema Değiştir (Change Theme)");
    
    let remStatus = (data.reminderEnabled !== undefined ? data.reminderEnabled : CONFIG.reminder.enabled) ? "Açık (On) 🔔" : "Kapalı (Off) 🔕";
    sAlert.addAction(`Hatırlatıcı (Reminder): ${remStatus}`);
    sAlert.addCancelAction("İptal");
    
    let sIdx = await sAlert.presentSheet();
    if (sIdx === 0) {
      let tAlert = new Alert();
      tAlert.title = "Tema Seç (Select Theme)";
      const themeKeys = Object.keys(THEMES);
      for (let k of themeKeys) tAlert.addAction(k);
      tAlert.addCancelAction("İptal");
      
      let tIdx = await tAlert.presentSheet();
      if (tIdx !== -1) {
        data.theme = themeKeys[tIdx];
        saveData(data);
        presentMenu(data);
      }
    } else if (sIdx === 1) {
      const current = data.reminderEnabled !== undefined ? data.reminderEnabled : CONFIG.reminder.enabled;
      data.reminderEnabled = !current;
      saveData(data);
      await setupReminders(data);
      presentMenu(data);
    }
  };
  table.addRow(settingsRow);
  
  const clearRow = new UITableRow();
  const clearCell = clearRow.addText("➖ Alışkanlıkları Sıfırla (Reset All)");
  clearCell.titleColor = new Color("#ff453a");
  clearCell.titleFont = Font.systemFont(15);
  clearRow.onSelect = async () => {
    let alert = new Alert();
    alert.title = "Uyarı";
    alert.message = "Tüm alışkanlıkları ve tiklerinizi sıfırlamak istediğinize emin misiniz?";
    alert.addDestructiveAction("Sıfırla (Reset)");
    alert.addCancelAction("İptal");
    if (await alert.presentAlert() === 0) {
      // Tüm günlük verileri de temizleyip alışkanlıkları boş bir liste yapıyoruz
      for (let key in data) {
        delete data[key];
      }
      data.habits = [];
      saveData(data);
      presentMenu(data);
    }
  };
  table.addRow(clearRow);
  
  const closeRow = new UITableRow();
  const closeCell = closeRow.addText("Done Logging");
  closeCell.titleColor = new Color("#8e8e93");
  closeCell.titleFont = Font.systemFont(16);
  closeRow.onSelect = async () => {
    Notification.removeAllPending();
    setupReminders();
    
    // Anlık geri bildirim için widget'i ekranda göster
    const widget = createWidget(data);
    await widget.presentMedium();
  };
  table.addRow(closeRow);
  
  await table.present(false);
}

// === WIDGET UI ===
function createWidget(data) {
  const w = new ListWidget();
  const themeName = data.theme || CONFIG.theme || "dark";
  const theme = THEMES[themeName] || THEMES.dark;
  w.backgroundColor = new Color(theme.bg);
  w.setPadding(8, 8, 8, 8); // Tighter widget padding
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDay = now.getDate();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  // Header section
  const headerStack = w.addStack();
  headerStack.layoutHorizontally();
  headerStack.centerAlignContent();
  
  const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const monthText = headerStack.addText(monthNames[currentMonth]);
  monthText.font = Font.boldSystemFont(12); // Daha büyük font
  monthText.textColor = new Color(theme.title);
  
  headerStack.addSpacer(); // Expanding spacer
  
  const yearText = headerStack.addText(currentYear.toString());
  yearText.font = Font.boldSystemFont(12); // Daha büyük font
  yearText.textColor = new Color(theme.title);
  
  w.addSpacer(8);
  
  // Daha büyük alan değerleri
  const labelWidth = 50; 
  const dotSize = 5;        
  const dotSpacing = 2;   
  const ratioWidth = 32;    
  
  // Marker arrow for current day
  const markerStack = w.addStack();
  markerStack.layoutHorizontally();
  
  markerStack.addSpacer(labelWidth); // Rigid left aligned constraint
  markerStack.addSpacer();           // Flexible space BEFORE dots
  
  for (let d = 1; d <= daysInMonth; d++) {
    const dStack = markerStack.addStack();
    dStack.size = new Size(dotSize, dotSize);
    if (d === currentDay) {
      const dShape = dStack.addText("▼");
      dShape.font = Font.systemFont(7); // Ok biraz daha büyük
      dShape.textColor = new Color(theme.marker);
    }
    if (d < daysInMonth) markerStack.addSpacer(dotSpacing);
  }
  
  markerStack.addSpacer();           // Flexible space AFTER dots
  markerStack.addSpacer(ratioWidth); // Rigid right aligned constraint
  
  w.addSpacer(6);
  
  // Widget üzerinde en fazla 5 görünür alışkanlık, sığması için 5'e sabitledik.
  const visibleHabits = data.habits.slice(0, 5);
  
  // Habit Tracking Grid
  for (let habit of visibleHabits) {
    const hStack = w.addStack();
    hStack.layoutHorizontally();
    hStack.centerAlignContent();
    
    // Label Column (Left Aligned Fixed Width)
    const labelStack = hStack.addStack();
    labelStack.size = new Size(labelWidth, 14);
    const labelText = labelStack.addText(habit.label);
    labelText.font = Font.systemFont(11); // Yazılar büyütüldü
    labelText.textColor = new Color(theme.text);
    labelText.leftAlignText(); // To touch the left edge
    
    hStack.addSpacer(); // Flexible space pushing dots to center
    
    let completionCount = 0;
    
    // Dot grid renderer
    for (let d = 1; d <= daysInMonth; d++) {
      const dateKey = `${currentYear}-${currentMonth}-${d}`;
      const isDone = data && data[dateKey] && data[dateKey][habit.id];
      if (isDone) completionCount++;
      
      const dStack = hStack.addStack();
      dStack.size = new Size(dotSize, dotSize);
      dStack.cornerRadius = dotSize / 2;
      dStack.backgroundColor = new Color(isDone ? habit.color : theme.emptyDot);
      
      if (d < daysInMonth) hStack.addSpacer(dotSpacing);
    }
    
    hStack.addSpacer(); // Flexible space pushing ratio to right
    
    // Monthly ratio (Right Aligned Fixed Width)
    const ratioStack = hStack.addStack();
    ratioStack.size = new Size(ratioWidth, 14);
    const ratioText = ratioStack.addText(`${completionCount}/${daysInMonth}`);
    ratioText.font = Font.boldSystemFont(11); // Yazılar büyütüldü
    ratioText.textColor = new Color(theme.marker);
    ratioText.rightAlignText();
    
    w.addSpacer(4);
  }
  
  w.addSpacer();
  return w;
}

// === LIFECYCLE ===
const data = loadData();

if (config.runsInApp) {
  // Opening script directly logs habits
  presentMenu(data);
} else {
  // Running in widget
  const widget = createWidget(data);
  Script.setWidget(widget);
  Script.complete();
}

setupReminders(data);
