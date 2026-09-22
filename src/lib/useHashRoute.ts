import { useEffect, useState } from 'react'

export type Route = 'customers' | 'accounts'

const ROUTES: Route[] = ['customers', 'accounts']

function readRoute(): Route {
  const raw = window.location.hash.replace(/^#\/?/, '')
  return ROUTES.includes(raw as Route) ? (raw as Route) : 'customers'
}

/** Minimal hash router: no dependency, and the URL stays shareable. */
export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(readRoute)

  useEffect(() => {
    const onChange = () => setRoute(readRoute())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return route
}
