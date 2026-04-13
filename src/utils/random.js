/** Crypto-safe random integer in [0, max) */
export function randomInt(max) {
  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    const arr = new Uint32Array(1)
    globalThis.crypto.getRandomValues(arr)
    return arr[0] % max
  }
  return Math.floor(Math.random() * max)
}

/** Fisher-Yates shuffle (returns new array) */
export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Weighted random pick from items with weights. Returns index. */
export function weightedPick(weights) {
  const total = weights.reduce((s, w) => s + w, 0)
  let r = Math.random() * total
  for (let i = 0; i < weights.length; i++) {
    r -= weights[i]
    if (r <= 0) return i
  }
  return weights.length - 1
}
