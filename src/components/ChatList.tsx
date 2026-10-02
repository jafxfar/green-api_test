import type { Chat } from '../types'
import { formatChatDate } from '../utils/format'
import Avatar from './Avatar'

type ChatListProps = {
  chats: Chat[]
  activeChatId: string | null
  onSelectChat: (chatId: string) => void
}

type ChatListItemProps = {
  chat: Chat
  isActive: boolean
  onSelectChat: (chatId: string) => void
}

const ChatListItem = ({ chat, isActive, onSelectChat }: ChatListItemProps) => {
  const lastMessage = chat.messages.at(-1)
  const preview = lastMessage
    ? `${lastMessage.direction === 'out' ? 'Вы: ' : ''}${lastMessage.text}`
    : 'Нет сообщений'

  const handleClick = () => onSelectChat(chat.id)

  return (
    <li>
      <button
        type="button"
        onClick={handleClick}
        aria-current={isActive ? 'true' : undefined}
        aria-label={`Открыть чат ${chat.title}`}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-left transition focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none ${
          isActive ? 'bg-brand-50' : 'hover:bg-slate-100'
        }`}
      >
        <Avatar seed={chat.id} title={chat.title} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <span className="truncate text-sm font-semibold text-slate-900">{chat.title}</span>
            <span className="shrink-0 text-xs text-slate-400">
              {formatChatDate(lastMessage?.timestamp ?? chat.createdAt)}
            </span>
          </div>
          <div className="mt-0.5 flex items-center justify-between gap-2">
            <span className="truncate text-sm text-slate-500">{preview}</span>
            {chat.unread > 0 && (
              <span
                className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-brand-500 px-1.5 text-xs font-semibold text-white"
                aria-label={`Непрочитанных: ${chat.unread}`}
              >
                {chat.unread}
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  )
}

const ChatList = ({ chats, activeChatId, onSelectChat }: ChatListProps) => {
  if (chats.length === 0) {
    return (
      <p className="px-6 py-10 text-center text-sm text-slate-400">
        Чатов пока нет. Введите номер телефона выше, чтобы начать переписку
      </p>
    )
  }

  return (
    <ul className="flex flex-col gap-0.5 px-2 pb-2" aria-label="Список чатов">
      {chats.map((chat) => (
        <ChatListItem key={chat.id} chat={chat} isActive={chat.id === activeChatId} onSelectChat={onSelectChat} />
      ))}
    </ul>
  )
}

export default ChatList
