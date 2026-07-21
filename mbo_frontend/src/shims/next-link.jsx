/**
 * Shim for the few places that did `import Link from "next/link"` and used
 * `<Link href="/path">`. In React Router the component is named `Link` but
 * takes `to=` instead of `href=`. The default export below is a thin wrapper
 * that accepts both, so legacy code with `href=` works without per-file edits.
 *
 * We also forward `ref` and pass-through `className` / `style` / `onClick`.
 */
import { Link, NavLink } from 'react-router-dom'

export default function NextLink({
  href,
  to,
  children,
  replace,
  prefetch,
  locale,
  ...rest
}) {
  const target = to != null ? to : href
  if (replace) {
    return (
      <Link to={target} replace {...rest}>
        {children}
      </Link>
    )
  }
  return (
    <Link to={target} {...rest}>
      {children}
    </Link>
  )
}

export { NavLink }
