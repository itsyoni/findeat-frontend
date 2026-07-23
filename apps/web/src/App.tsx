import { useCallback, useEffect, useState } from 'react'
import { DashboardPage } from './pages/DashboardPage'
import { legalPageKind } from './lib/legalRoutes'
import { PublicLegalPage } from './pages/LegalPage'
import { LoginPage } from './pages/LoginPage'
import { navigateTo, usePathname } from './lib/navigation'
import './App.css'

export default function App() {
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(localStorage.getItem('findeat-business-token')),
  )
  const legalPage = legalPageKind(pathname)

  useEffect(() => {
    if (legalPage) return
    if (authenticated && (pathname === '/' || pathname === '/login')) {
      navigateTo('/home', true)
    } else if (!authenticated && pathname !== '/login') {
      navigateTo('/login', true)
    }
  }, [authenticated, legalPage, pathname])

  const logout = useCallback(() => {
    localStorage.removeItem('findeat-business-token')
    setAuthenticated(false)
    navigateTo('/login', true)
  }, [])

  if (legalPage) {
    return <PublicLegalPage kind={legalPage} />
  }

  return authenticated
    ? <DashboardPage onLogout={logout} />
    : <LoginPage onLogin={() => {
      setAuthenticated(true)
      navigateTo('/home', true)
    }} />
}
