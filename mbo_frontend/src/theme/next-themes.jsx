import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'

/**
 * Drop-in replacement for `next-themes`. Exports `ThemeProvider` and
 * `useTheme` so ported code keeps its `import { useTheme } from "next-themes"`
 * imports unchanged. The Vite alias `next-themes` → this file.
 *
 * Mirrors the subset of next-themes semantics used by this codebase:
 *   attribute="data-theme", defaultTheme, storageKey, disableTransitionOnChange
 */
const ThemeContext = createContext({
  theme: 'light',
  setTheme: () => {},
  resolvedTheme: 'light',
  systemTheme: 'light',
  themes: [],
})

function applyThemeAttribute(attribute, theme) {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute(attribute, theme)
}

export function ThemeProvider({
  children,
  attribute = 'data-theme',
  defaultTheme = 'light',
  storageKey = 'admin-theme',
  disableTransitionOnChange = false,
  forcedTheme,
  themes: forcedThemes,
}) {
  const [theme, setThemeState] = useState(() => {
    if (typeof window === 'undefined') return defaultTheme
    try {
      return window.localStorage.getItem(storageKey) || defaultTheme
    } catch {
      return defaultTheme
    }
  })

  useEffect(() => {
    const finalTheme = forcedTheme || theme
    applyThemeAttribute(attribute, finalTheme)
    try {
      window.localStorage.setItem(storageKey, finalTheme)
    } catch {
      /* storage may be unavailable */
    }

    if (disableTransitionOnChange) {
      const prev = document.body.style.transition
      document.body.style.transition = 'none'
      const id = requestAnimationFrame(() => {
        document.body.style.transition = prev
      })
      return () => cancelAnimationFrame(id)
    }
  }, [theme, attribute, storageKey, disableTransitionOnChange, forcedTheme])

  const value = useMemo(
    () => ({
      theme,
      setTheme: setThemeState,
      resolvedTheme: theme,
      systemTheme: 'light',
      themes: forcedThemes || [defaultTheme],
    }),
    [theme, defaultTheme, forcedThemes],
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  return useContext(ThemeContext)
}
