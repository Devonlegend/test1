import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services'

const TIMEOUT_MS = 60 * 60 * 1000 // 60 minutes, matches backend access token lifetime

export function useInactivityLogout() {
  const navigate = useNavigate()
  const timerRef = useRef(null)

  useEffect(() => {
    function resetTimer() {
      if (timerRef.current) clearTimeout(timerRef.current)
      timerRef.current = setTimeout(async () => {
        try {
          await logout()
        } catch {
          // even if the call fails, we still redirect
        } finally {
          navigate('/login', { replace: true })
        }
      }, TIMEOUT_MS)
    }

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'touchmove',
      'scroll',
      'click',
    ]

    events.forEach((e) => window.addEventListener(e, resetTimer))
    resetTimer()

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [navigate])
}
