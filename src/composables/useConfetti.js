import confetti from 'canvas-confetti'

export function useConfetti() {
  function celebrate(opts = {}) {
    confetti({
      particleCount: opts.particles || 80,
      spread: opts.spread || 70,
      origin: { y: opts.y || 0.6 },
      ...opts,
    })
  }

  function bigCelebration() {
    const end = Date.now() + 1500
    const interval = setInterval(() => {
      if (Date.now() > end) return clearInterval(interval)
      confetti({ particleCount: 30, spread: 60, startVelocity: 30, origin: { x: Math.random(), y: Math.random() * 0.4 } })
    }, 150)
  }

  return { celebrate, bigCelebration }
}
