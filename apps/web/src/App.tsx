import { useCallback, useState } from 'react'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import './App.css'

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => Boolean(localStorage.getItem('findeat-business-token')),
  )

  const logout = useCallback(() => {
    localStorage.removeItem('findeat-business-token')
    setAuthenticated(false)
  }, [])

  return authenticated
    ? <DashboardPage onLogout={logout} />
    : <LoginPage onLogin={() => setAuthenticated(true)} />
}
