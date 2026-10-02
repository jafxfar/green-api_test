import type { Chat, Message } from '../types'
import { formatPhone } from '../utils/phone'
import Avatar from './Avatar'
import MessageInput from './MessageInput'
import MessageList from './MessageList'

type ChatWindowProps = {
  chat: Chat
  onSend: (chat: Chat, text: string) => void
  onRetry: (chat: Chat, message: Message) => void
  onBack: () => void
}

const ChatWindow = ({ chat, onSend, onRetry, onBack }: ChatWindowProps) => {
  const subtitle = chat.phone ? formatPhone(chat.phone) : 'Telegram'
  const showSubtitle = subtitle !== chat.title

  const handleSend = (text: string) => onSend(chat, text)
  const handleRetry = (message: Message) => onRetry(chat, message)

  return (
    <section className="flex h-full min-w-0 flex-1 flex-col bg-chat-bg" aria-label={`Чат с ${chat.title}`}>
      <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-2.5">
        <button
          type="button"
          onClick={onBack}
          aria-label="Назад к списку чатов"
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none md:hidden"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <Avatar seed={chat.id} title={chat.title} size="md" />
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-slate-900">{chat.title}</h2>
          {showSubtitle && <p className="truncate text-xs text-slate-500">{subtitle}</p>}
        </div>
      </header>
      <MessageList messages={chat.messages} onRetry={handleRetry} />
      <MessageInput key={chat.id} onSend={handleSend} />
    </section>
  )
}

export default ChatWindow
