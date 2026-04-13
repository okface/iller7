import { onMounted, onUnmounted } from 'vue'

/**
 * Detects horizontal swipe gestures on a target element.
 * @param {Ref<HTMLElement>} targetRef - ref to the element
 * @param {Object} callbacks - { onSwipeLeft?, onSwipeRight? }
 */
export function useSwipe(targetRef, callbacks = {}) {
  let startX = 0, startY = 0
  const MIN_DISTANCE = 50
  const MAX_ANGLE = 30 // degrees

  function onTouchStart(e) {
    startX = e.touches[0].clientX
    startY = e.touches[0].clientY
  }

  function onTouchEnd(e) {
    const dx = e.changedTouches[0].clientX - startX
    const dy = e.changedTouches[0].clientY - startY
    const angle = Math.abs(Math.atan2(dy, dx) * 180 / Math.PI)

    if (Math.abs(dx) < MIN_DISTANCE) return
    if (angle > MAX_ANGLE && angle < (180 - MAX_ANGLE)) return // too vertical

    if (dx < 0 && callbacks.onSwipeLeft) callbacks.onSwipeLeft()
    if (dx > 0 && callbacks.onSwipeRight) callbacks.onSwipeRight()
  }

  onMounted(() => {
    const el = targetRef.value || document
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend', onTouchEnd, { passive: true })
  })

  onUnmounted(() => {
    const el = targetRef.value || document
    el.removeEventListener('touchstart', onTouchStart)
    el.removeEventListener('touchend', onTouchEnd)
  })
}
