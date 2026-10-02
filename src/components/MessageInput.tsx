import { useRef, useState, type ChangeEvent, type FormEvent, type KeyboardEvent } from 'react'

type MessageInputProps = {
  onSend: (text: string) => void
}

const MAX_MESSAGE_LENGTH = 4096
const MAX_TEXTAREA_HEIGHT = 160

const MessageInput = ({ onSend }: MessageInputProps) => {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const trimmedText = text.trim()
  const canSend = trimmedText.length > 0

  const resizeTextarea = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_TEXTAREA_HEIGHT)}px`
  }

  const submit = () => {
    if (!canSend) return
    onSend(trimmedText)
    setText('')
    requestAnimationFrame(resizeTextarea)
  }

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.target.value)
    resizeTextarea()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
    event.preventDefault()
    submit()
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    submit()
  }

  return (
    <form onSubmit={handleSubmit} className="border-t border-slate-200 bg-white px-4 py-3">
      <div className="mx-auto flex max-w-3xl items-end gap-2">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          maxLength={MAX_MESSAGE_LENGTH}
          rows={1}
          placeholder="Сообщение"
          aria-label="Текст сообщения"
          className="max-h-40 min-h-11 flex-1 resize-none rounded-2xl bg-slate-100 px-4 py-2.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Отправить сообщение"
          title="Отправить"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500 text-white transition hover:bg-brand-600 focus-visible:ring-4 focus-visible:ring-brand-100 focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
            <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8z" />
          </svg>
        </button>
      </div>
    </form>
  )
}

export default MessageInput
