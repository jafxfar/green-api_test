import { useState, type ChangeEvent, type FormEvent } from 'react'
import { normalizePhone } from '../utils/phone'

type NewChatFormProps = {
  onCreateChat: (phone: string) => void
}

const NewChatForm = ({ onCreateChat }: NewChatFormProps) => {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value.replace(/[^\d\s()+-]/g, ''))
    if (error) setError(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const phone = normalizePhone(value)
    if (!phone) {
      setError('Введите номер в международном формате, например 79001234567')
      return
    }
    onCreateChat(phone)
    setValue('')
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-3" noValidate>
      <div className="flex gap-2">
        <input
          value={value}
          onChange={handleChange}
          type="tel"
          inputMode="tel"
          placeholder="Номер телефона получателя"
          aria-label="Номер телефона получателя"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? 'new-chat-error' : undefined}
          className="min-w-0 flex-1 rounded-xl bg-slate-100 px-4 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          aria-label="Создать чат"
          title="Создать чат"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-500 text-white transition hover:bg-brand-600 focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 5v14M5 12h14" strokeLinecap="round" />
          </svg>
        </button>
      </div>
      {error && (
        <p id="new-chat-error" role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </form>
  )
}

export default NewChatForm
