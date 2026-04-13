export const STORAGE_KEYS = {
  PROGRESS: 'iller7-progress',
  HISTORY: 'iller7-history',
  SUBJECT: 'iller7-selected-subject',
  DARK_MODE: 'iller7-dark-mode',
  BOOKMARKS: 'iller7-bookmarks',
}

export const SRS_BUCKETS = { NEW: 1, LEARNING: 2, REVIEWING: 3, FAMILIAR: 4, MASTERED: 5 }
export const SRS_WEIGHTS = { 1: 40, 2: 25, 3: 20, 4: 10, 5: 5 }
export const DECAY_DAYS = 7  // Demote if unseen for this many days

export const ACHIEVEMENTS = [
  { id: 'first_session', label: 'Första sessionen', desc: 'Genomför din första session' },
  { id: 'perfect_10', label: 'Perfekt 10', desc: 'Få 10/10 i en session' },
  { id: 'streak_3', label: '3-dagarssvit', desc: 'Studera 3 dagar i rad' },
  { id: 'streak_7', label: 'Veckosvit', desc: 'Studera 7 dagar i rad' },
  { id: 'streak_14', label: '14-dagarssvit', desc: 'Studera 14 dagar i rad' },
  { id: 'streak_30', label: 'Månadssvit', desc: 'Studera 30 dagar i rad' },
  { id: 'streak_100', label: '100-dagarssvit', desc: 'Studera 100 dagar i rad' },
  { id: 'seen_100', label: 'Hundra frågor', desc: 'Svara på 100 frågor totalt' },
  { id: 'seen_500', label: '500 frågor', desc: 'Svara på 500 frågor totalt' },
  { id: 'mastered_10', label: '10 bemästrade', desc: 'Bemästra 10 frågor' },
  { id: 'mastered_50', label: '50 bemästrade', desc: 'Bemästra 50 frågor' },
  { id: 'mastered_100', label: '100 bemästrade', desc: 'Bemästra 100 frågor' },
  { id: 'exam_pass', label: 'Godkänd!', desc: 'Klara ett övningsprov' },
]

export const MASTERY_LEVELS = [
  { name: 'Ej påbörjad', min: 0, color: 'stone' },
  { name: 'Brons', min: 0.25, color: 'amber' },
  { name: 'Silver', min: 0.5, color: 'slate' },
  { name: 'Guld', min: 0.75, color: 'yellow' },
]
