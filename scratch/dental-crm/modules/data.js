// ============================================================
// DATA STORE – Shared mock data for all modules
// ============================================================

const DB = {
    patients: [
        { id: 1001, name: 'Ahmet Yılmaz', phone: '0532 111 22 33', dob: '1985-04-12', gender: 'E', blood: 'A+', lastVisit: '2026-02-14', status: 'active', balance: -1200, ltv: 18400, treatments: ['İmplant (23)', 'Kanal Tedavisi (36)'], ref: 'Google', teeth: { 23: 'implant', 36: 'filled', 47: 'missing' } },
        { id: 1002, name: 'Mehmet Kaya', phone: '0541 333 44 55', dob: '1978-09-20', gender: 'E', blood: 'B+', lastVisit: '2026-01-30', status: 'recall', balance: 0, ltv: 11200, treatments: ['Protez Alt Çene'], ref: 'Hasta Referansı', teeth: { 11: 'crown', 12: 'crown', 21: 'crown', 22: 'crown' } },
        { id: 1003, name: 'Zeynep Arslan', phone: '0555 222 66 77', dob: '1994-12-05', gender: 'K', blood: 'O+', lastVisit: '2026-03-01', status: 'active', balance: 0, ltv: 6400, treatments: ['Ortodonti Braket'], ref: 'Instagram', teeth: {} },
        { id: 1004, name: 'Ayşe Demir', phone: '0505 888 99 00', dob: '1990-07-18', gender: 'K', blood: 'AB+', lastVisit: '2026-02-28', status: 'pending_treatment', balance: -3800, ltv: 9100, treatments: ['İmplant Planı (teklif verildi)'], ref: 'Google', teeth: { 36: 'missing', 46: 'missing' } },
        { id: 1005, name: 'Ali Öztürk', phone: '0533 450 12 34', dob: '1969-03-22', gender: 'E', blood: 'A-', lastVisit: '2025-09-10', status: 'inactive', balance: 0, ltv: 22600, treatments: ['Tam Protez', 'İmplant (x4)'], ref: 'Hasta Referansı', teeth: { 11: 'missing', 12: 'missing', 21: 'missing', 22: 'missing', 23: 'missing', 31: 'missing', 32: 'missing' } },
        { id: 1006, name: 'Fatma Çelik', phone: '0546 321 87 65', dob: '2001-06-30', gender: 'K', blood: 'O-', lastVisit: '2026-03-05', status: 'active', balance: 0, ltv: 2200, treatments: ['Diş Beyazlatma'], ref: 'Instagram', teeth: {} },
        { id: 1007, name: 'Hasan Kılıç', phone: '0537 654 32 10', dob: '1975-11-14', gender: 'E', blood: 'B-', lastVisit: '2025-12-20', status: 'no_show', balance: 0, ltv: 4800, treatments: ['Kanal Tedavisi (Yarım)'], ref: 'Walk-in', teeth: { 36: 'filled', 46: 'crown' } }
    ],
    appointments: [
        { id: 'A001', patientId: 1001, patient: 'Ahmet Yılmaz', time: '09:00', duration: 60, chair: 1, type: 'İmplant Kontrol', status: 'confirmed', doctor: 'Dr. Kaya' },
        { id: 'A002', patientId: 1003, patient: 'Zeynep Arslan', time: '10:00', duration: 45, chair: 1, type: 'Ortodonti Ayar', status: 'confirmed', doctor: 'Dr. Kaya' },
        { id: 'A003', patientId: 1004, patient: 'Ayşe Demir', time: '11:30', duration: 120, chair: 2, type: 'İmplant Operasyon', status: 'no_show', doctor: 'Dr. Kaya' },
        { id: 'A004', patientId: 1006, patient: 'Fatma Çelik', time: '09:30', duration: 60, chair: 2, type: 'Beyazlatma', status: 'confirmed', doctor: 'Dr. Demir' },
        { id: 'A005', patientId: 1002, patient: 'Mehmet Kaya', time: '14:00', duration: 90, chair: 1, type: 'Protez Ölçü', status: 'confirmed', doctor: 'Dr. Kaya' },
        { id: 'A006', patientId: 1007, patient: 'Hasan Kılıç', time: '15:30', duration: 60, chair: 2, type: 'Kanal Devam', status: 'waiting', doctor: 'Dr. Demir' }
    ],
    treatments: [
        { code: 'IMP-01', name: 'İmplant (Tekil)', price: 18000, category: 'İmplant' },
        { code: 'IMP-02', name: 'All-On-4 (Çene)', price: 65000, category: 'İmplant' },
        { code: 'KAN-01', name: 'Kanal Tedavisi (Ön)', price: 2800, category: 'Kanal' },
        { code: 'KAN-02', name: 'Kanal Tedavisi (Arka)', price: 3500, category: 'Kanal' },
        { code: 'ORT-01', name: 'Ortodonti Metal Braket', price: 14000, category: 'Ortodonti' },
        { code: 'ORT-02', name: 'Şeffaf Aligner', price: 24000, category: 'Ortodonti' },
        { code: 'KRN-01', name: 'Porselen Kaplama (Tekil)', price: 4500, category: 'Kaplama' },
        { code: 'PRO-01', name: 'Tam Protez (Çene)', price: 8500, category: 'Protez' },
        { code: 'BEY-01', name: 'Ofis Beyazlatma', price: 2500, category: 'Estetik' },
        { code: 'DOL-01', name: 'Kompozit Dolgu', price: 800, category: 'Restorasyon' },
        { code: 'DOL-02', name: 'Seramik İnley', price: 2200, category: 'Restorasyon' },
        { code: 'EKS-01', name: 'Çekim (Basit)', price: 600, category: 'Cerrahi' }
    ],
    payments: [
        { id: 'P001', patientId: 1001, date: '2026-02-14', amount: 5000, method: 'Kredi Kartı', note: 'İmplant 1. taksit', type: 'income' },
        { id: 'P002', patientId: 1003, date: '2026-03-01', amount: 3000, method: 'Nakit', note: 'Ortodonti avans', type: 'income' },
        { id: 'P003', patientId: 1006, date: '2026-03-05', amount: 2500, method: 'Kredi Kartı', note: 'Beyazlatma tam ödeme', type: 'income' },
        { id: 'P004', patientId: 1002, date: '2026-01-30', amount: 4000, method: 'Havale', note: 'Protez avans', type: 'income' },
        { id: 'P005', patientId: 1001, date: '2026-03-09', amount: 5000, method: 'Kredi Kartı', note: 'İmplant 2. taksit', type: 'income' }
    ],
    recallQueue: [
        { patientId: 1001, patient: 'Ahmet Yılmaz', treatment: 'İmplant (23)', completedDate: '2025-09-08', recallDate: '2026-03-08', status: 'overdue', phone: '0532 111 22 33' },
        { patientId: 1002, patient: 'Mehmet Kaya', treatment: 'Kanal Tedavisi (36)', completedDate: '2025-09-15', recallDate: '2026-03-15', status: 'due_soon', phone: '0541 333 44 55' },
        { patientId: 1005, patient: 'Ali Öztürk', treatment: 'İmplant (x4)', completedDate: '2025-09-10', recallDate: '2026-03-10', status: 'today', phone: '0533 450 12 34' }
    ],
    leads: [
        { patientId: 1004, patient: 'Ayşe Demir', treatment: 'İmplant (x2)', offerAmount: 36000, offerDate: '2026-02-12', daysSince: 25, score: 87, assignedTo: 'Resepsiyon A', phone: '0505 888 99 00' },
        { patientId: 1007, patient: 'Hasan Kılıç', treatment: 'Kanal Tedavisi Devam', offerAmount: 3500, offerDate: '2026-02-20', daysSince: 18, score: 62, assignedTo: 'Resepsiyon B', phone: '0537 654 32 10' }
    ],
    todayRevenue: 12500,
    todayTarget: 25000,
    biData: {
        monthly: [8200, 14500, 11200, 18900, 22400, 19800, 24000, 21000, 28000, 25400, 30000, 27500],
        months: ['Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara', 'Oca', 'Şub', 'Mar'],
        categoryRevenue: { 'İmplant': 68000, 'Ortodonti': 42000, 'Kaplama': 18000, 'Kanal': 12000, 'Protez': 17000, 'Estetik': 8500 },
        ltv: 11600,
        cac: 420,
        chairEfficiency: 74,
        conversionRate: 68
    }
};

// Utilities
function fmt(n) { return new Intl.NumberFormat('tr-TR').format(n); }
function fmtMoney(n) { return '₺' + fmt(n); }
function initials(name) { return name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase(); }
function avatarColor(id) { const c = ['green', 'blue', 'orange', 'purple', 'teal']; return c[id % c.length]; }
function daysSince(dateStr) {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now - d) / 86400000);
}
