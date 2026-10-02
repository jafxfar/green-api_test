import ChatLayout from './components/ChatLayout'
import LoginForm from './components/LoginForm'
import { useCredentials } from './hooks/useCredentials'

const App = () => {
  const { credentials, login, logout } = useCredentials()

  if (!credentials) return <LoginForm onLogin={login} />

  return <ChatLayout key={credentials.idInstance} credentials={credentials} onLogout={logout} />
}

export default App
