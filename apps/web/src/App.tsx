import { useCallback, useEffect, useState } from 'react'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { navigateTo, usePathname } from './lib/navigation'
import './App.css'

export default function App() {
  const pathname = usePathname()
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(localStorage.getItem('findeat-business-token')),
  )

  useEffect(() => {
    if (authenticated && (pathname === '/' || pathname === '/login')) {
      navigateTo('/home', true)
    } else if (!authenticated && pathname !== '/login') {
      navigateTo('/login', true)
    }
  }, [authenticated, pathname])

  const logout = useCallback(() => {
    localStorage.removeItem('findeat-business-token')
    setAuthenticated(false)
    navigateTo('/login', true)
  }, [])

  return authenticated
    ? <DashboardPage onLogout={logout} />
    : <LoginPage onLogin={() => {
      setAuthenticated(true)
      navigateTo('/home', true)
    }} />
}
