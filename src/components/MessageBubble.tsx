import type { Message } from '../types'
import { formatTime } from '../utils/format'

type MessageBubbleProps = {
  message: Message
  onRetry: (message: Message) => void
}

const StatusIcon = ({ status }: Pick<Message, 'status'>) => {
  if (status === 'sending') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-label="Отправляется">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" strokeLinecap="round" />
      </svg>
    )
  }
  if (status === 'sent') {
    return (
      <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-label="Отправлено">
        <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  return null
}

const MessageBubble = ({ message, onRetry }: MessageBubbleProps) => {
  const isOutgoing = message.direction === 'out'
  const isError = message.status === 'error'

  const handleRetry = () => onRetry(message)

  return (
    <li className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-3.5 py-2 shadow-sm ${
          isOutgoing ? 'rounded-br-md bg-brand-500 text-white' : 'rounded-bl-md bg-white text-slate-900'
        } ${isError ? 'opacity-70' : ''}`}
      >
        <p className="text-[15px] leading-snug break-words whitespace-pre-wrap">{message.text}</p>
        <div
          className={`mt-1 flex items-center justify-end gap-1 text-[11px] ${
            isOutgoing ? 'text-white/75' : 'text-slate-400'
          }`}
        >
          <time dateTime={new Date(message.timestamp).toISOString()}>{formatTime(message.timestamp)}</time>
          {isOutgoing && <StatusIcon status={message.status} />}
        </div>
      </div>
      {isError && (
        <button
          type="button"
          onClick={handleRetry}
          aria-label="Повторить отправку сообщения"
          className="mt-1 rounded text-xs text-red-500 hover:underline focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none"
        >
          Не отправлено. Повторить
        </button>
      )}
    </li>
  )
}

export default MessageBubble
