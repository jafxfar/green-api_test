import { useState, type ChangeEvent, type FormEvent } from 'react'
import { deriveApiUrl, getStateInstance, GreenApiError, isValidApiUrl } from '../api/greenApi'
import type { Credentials, InstanceState } from '../types'

type LoginFormProps = {
  onLogin: (credentials: Credentials) => void
}

const STATE_MESSAGES: Record<Exclude<InstanceState, 'authorized'>, string> = {
  notAuthorized: 'Инстанс не авторизован. Подключите Telegram-аккаунт в личном кабинете GREEN-API',
  blocked: 'Инстанс заблокирован',
  sleepMode: 'Инстанс в спящем режиме. Откройте Telegram на телефоне',
  starting: 'Инстанс запускается, попробуйте через минуту',
  yellowCard: 'Отправка сообщений с инстанса временно ограничена',
}

const inputClassName =
  'w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-100'

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState(deriveApiUrl(''))
  const [isApiUrlEdited, setIsApiUrlEdited] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleIdInstanceChange = (event: ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '')
    setIdInstance(value)
    if (!isApiUrlEdited) setApiUrl(deriveApiUrl(value))
  }

  const handleApiTokenChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiTokenInstance(event.target.value.trim())
  }

  const handleApiUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    setApiUrl(event.target.value.trim())
    setIsApiUrlEdited(true)
  }

  const validate = () => {
    if (!idInstance) return 'Введите idInstance'
    if (!apiTokenInstance) return 'Введите apiTokenInstance'
    if (!isValidApiUrl(apiUrl)) return 'apiUrl должен быть https-адресом домена green-api.com'
    return null
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (isLoading) return

    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }

    const credentials: Credentials = { apiUrl, idInstance, apiTokenInstance }
    setError(null)
    setIsLoading(true)
    try {
      const { stateInstance } = await getStateInstance(credentials)
      if (stateInstance !== 'authorized') {
        setError(STATE_MESSAGES[stateInstance] ?? `Состояние инстанса: ${stateInstance}`)
        return
      }
      onLogin(credentials)
    } catch (caught) {
      setError(caught instanceof GreenApiError ? caught.message : 'Не удалось проверить учетные данные')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="flex min-h-full items-center justify-center bg-chat-bg p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl shadow-slate-200/70"
        aria-labelledby="login-title"
        noValidate
      >
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-violet-500 text-2xl font-bold text-white">
            G
          </div>
          <h1 id="login-title" className="text-2xl font-semibold text-slate-900">
            Вход в чат
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Введите параметры инстанса Telegram из личного кабинета GREEN-API
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">idInstance</span>
            <input
              className={inputClassName}
              value={idInstance}
              onChange={handleIdInstanceChange}
              inputMode="numeric"
              autoComplete="username"
              placeholder="4100000000"
              aria-label="idInstance"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">apiTokenInstance</span>
            <input
              className={inputClassName}
              value={apiTokenInstance}
              onChange={handleApiTokenChange}
              type="password"
              autoComplete="current-password"
              placeholder="••••••••••••••••"
              aria-label="apiTokenInstance"
              required
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-slate-700">apiUrl</span>
            <input
              className={inputClassName}
              value={apiUrl}
              onChange={handleApiUrlChange}
              type="url"
              placeholder="https://4100.api.green-api.com"
              aria-label="apiUrl"
              aria-describedby="api-url-hint"
              required
            />
            <span id="api-url-hint" className="text-xs text-slate-400">
              Заполняется автоматически по idInstance, при необходимости скопируйте из личного кабинета
            </span>
          </label>
        </div>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="mt-6 w-full rounded-xl bg-brand-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}

export default LoginForm
