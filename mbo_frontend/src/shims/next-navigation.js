/**
 * Shim for `next/navigation` consumers ported from the Next.js build.
 * Lets legacy code keep using `import { useRouter, usePathname, useSearchParams,
 * useParams } from "react-router-dom"` semantics written against the Next API.
 *
 *   useRouter()        → { push(path), replace(path), refresh(), back(),
 *                         prefetch(() => {}) [, pathname] }
 *   usePathname()      → current location.pathname
 *   useSearchParams()  → re-exported from react-router-dom
 *   useParams()        → re-exported from react-router-dom
 */
import { useMemo } from 'react'
import {
  useNavigate,
  useLocation,
  useSearchParams,
  useParams,
} from 'react-router-dom'

export function useRouter() {
  const navigate = useNavigate()
  const location = useLocation()
  return useMemo(() => ({
    push: (path, opts) => navigate(path, opts),
    replace: (path, opts) => navigate(path, { replace: true, ...(opts || {}) }),
    refresh: () => window.location.reload(),
    back: () => navigate(-1),
    forward: () => navigate(1),
    prefetch: async () => {},
    pathname: location.pathname,
  }), [navigate, location.pathname])
}

export function usePathname() {
  return useLocation().pathname
}

export { useSearchParams, useParams }
