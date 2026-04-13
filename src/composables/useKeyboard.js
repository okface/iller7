import { onMounted, onUnmounted } from 'vue'

/**
 * @param {Object} handlers - { key: callback } map
 * Keys: 'a','b','c','d','1','2','3','4','Enter',' ','Escape'
 */
export function useKeyboard(handlers) {
  function onKeydown(e) {
    // Don't capture if typing in an input
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return

    const key = e.key.toLowerCase()
    const handler = handlers[key] || handlers[e.key]
    if (handler) {
      e.preventDefault()
      handler(e)
    }
  }

  onMounted(() => window.addEventListener('keydown', onKeydown))
  onUnmounted(() => window.removeEventListener('keydown', onKeydown))
}
