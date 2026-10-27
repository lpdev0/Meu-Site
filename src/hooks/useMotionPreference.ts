import { useSyncExternalStore } from 'react'

const query = '(prefers-reduced-motion: reduce)'
const subscribe = (onChange: () => void) => {
  const media = window.matchMedia(query)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}
const getSnapshot = () => window.matchMedia(query).matches

// Unlike the installed Motion hook, this also updates during an open session.
export function useMotionPreference() {
  return useSyncExternalStore(subscribe, getSnapshot, () => false)
}
