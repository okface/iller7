export function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export function daysSince(timestamp) {
  if (!timestamp) return Infinity
  return (Date.now() - timestamp) / (1000 * 60 * 60 * 24)
}

export function daysAgoStr(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().slice(0, 10)
}
