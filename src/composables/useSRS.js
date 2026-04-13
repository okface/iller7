import { SRS_BUCKETS, SRS_WEIGHTS, DECAY_DAYS } from '@/utils/constants.js'
import { shuffle, weightedPick } from '@/utils/random.js'
import { daysSince } from '@/utils/dates.js'

/**
 * Apply time-based decay: demote questions unseen for >DECAY_DAYS.
 * Mutates the progress object in place.
 */
export function applyDecay(progress) {
  const now = Date.now()
  for (const [id, p] of Object.entries(progress)) {
    if (p.bucket >= SRS_BUCKETS.FAMILIAR && daysSince(p.lastSeen) > DECAY_DAYS) {
      p.bucket = Math.max(SRS_BUCKETS.LEARNING, p.bucket - 1)
    }
  }
}

/**
 * Record an answer and update SRS bucket.
 * Returns the updated progress entry.
 */
export function recordAnswer(entry, isCorrect) {
  const updated = { ...entry, lastSeen: Date.now(), totalSeen: (entry.totalSeen || 0) + 1 }
  if (isCorrect) {
    updated.totalCorrect = (entry.totalCorrect || 0) + 1
    updated.consecutiveCorrect = (entry.consecutiveCorrect || 0) + 1
    updated.lastWasCorrect = true
    // Promote: bucket up by 1 (max 5)
    if (updated.consecutiveCorrect >= updated.bucket) {
      updated.bucket = Math.min(SRS_BUCKETS.MASTERED, updated.bucket + 1)
    }
  } else {
    updated.totalWrong = (entry.totalWrong || 0) + 1
    updated.consecutiveCorrect = 0
    updated.lastWasCorrect = false
    // Demote to bucket 1
    updated.bucket = SRS_BUCKETS.NEW
  }
  return updated
}

/**
 * Select questions using SRS weighting.
 * @param {Array} candidates - question objects
 * @param {Object} progress - progress map { questionId: { bucket, ... } }
 * @param {number} count - how many to select
 * @returns {Array} selected questions (shuffled)
 */
export function selectSRS(candidates, progress, count) {
  if (candidates.length <= count) return shuffle(candidates)

  // Group by bucket
  const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [] }
  for (const q of candidates) {
    const bucket = progress[q.id]?.bucket || SRS_BUCKETS.NEW
    buckets[bucket].push(q)
  }

  const selected = new Set()
  const result = []

  while (result.length < count && result.length < candidates.length) {
    // Build weight array for non-empty buckets
    const available = Object.entries(buckets).filter(([, qs]) => qs.some(q => !selected.has(q.id)))
    if (available.length === 0) break

    const bNums = available.map(([b]) => Number(b))
    const weights = bNums.map(b => SRS_WEIGHTS[b])
    const idx = weightedPick(weights)
    const bucket = bNums[idx]

    // Pick random question from chosen bucket that hasn't been selected yet
    const pool = buckets[bucket].filter(q => !selected.has(q.id))
    if (pool.length === 0) continue

    const pick = pool[Math.floor(Math.random() * pool.length)]
    selected.add(pick.id)
    result.push(pick)
  }

  return shuffle(result)
}

/**
 * Select questions for focus mode (prioritize weak questions).
 */
export function selectFocus(candidates, progress, count) {
  const scored = candidates.map(q => {
    const p = progress[q.id]
    if (!p || p.totalSeen === 0) return { q, score: 0 }

    const wrongRate = p.totalWrong / p.totalSeen
    const recency = Math.max(0, 1 - daysSince(p.lastSeen) / 14)
    const lastWrongBonus = p.lastWasCorrect ? 0 : 250
    const hasWrongHistory = p.totalWrong > 0 ? 1000 : 0

    return {
      q,
      score: hasWrongHistory + wrongRate * 200 + lastWrongBonus + recency * 50
    }
  })

  scored.sort((a, b) => b.score - a.score)

  // Take top scorers that have wrong history, then backfill with SRS
  const focused = scored.filter(s => s.score >= 1000).slice(0, count).map(s => s.q)

  if (focused.length < count) {
    const remaining = candidates.filter(q => !focused.some(f => f.id === q.id))
    const backfill = selectSRS(remaining, progress, count - focused.length)
    focused.push(...backfill)
  }

  return shuffle(focused.slice(0, count))
}

/** Get initial progress entry for a new question */
export function newProgressEntry() {
  return {
    bucket: SRS_BUCKETS.NEW,
    consecutiveCorrect: 0,
    totalSeen: 0,
    totalCorrect: 0,
    totalWrong: 0,
    lastSeen: null,
    lastWasCorrect: null,
  }
}
