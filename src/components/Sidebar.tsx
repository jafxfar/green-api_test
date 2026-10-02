import type { ConnectionStatus } from '../hooks/useNotificationPolling'
import type { Chat } from '../types'
import ChatList from './ChatList'
import NewChatForm from './NewChatForm'

type SidebarProps = {
  chats: Chat[]
  activeChatId: string | null
  idInstance: string
  connectionStatus: ConnectionStatus
  onSelectChat: (chatId: string) => void
  onCreateChat: (phone: string) => void
  onLogout: () => void
}

const STATUS_LABELS: Record<ConnectionStatus, string> = {
  connecting: 'Подключение…',
  online: 'В сети',
  error: 'Нет соединения, переподключаемся…',
}

const STATUS_DOT_CLASSES: Record<ConnectionStatus, string> = {
  connecting: 'bg-amber-400',
  online: 'bg-emerald-500',
  error: 'bg-red-500',
}

const Sidebar = ({
  chats,
  activeChatId,
  idInstance,
  connectionStatus,
  onSelectChat,
  onCreateChat,
  onLogout,
}: SidebarProps) => (
  <aside className="flex h-full w-full flex-col border-r border-slate-200 bg-white md:w-[360px] md:shrink-0">
    <header className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
      <div className="min-w-0">
        <h1 className="text-xl font-semibold text-slate-900">Чаты</h1>
        <p className="flex items-center gap-1.5 truncate text-xs text-slate-500" role="status">
          <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_CLASSES[connectionStatus]}`} aria-hidden="true" />
          {STATUS_LABELS[connectionStatus]} · {idInstance}
        </p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        aria-label="Выйти"
        title="Выйти"
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:outline-none"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </header>
    <NewChatForm onCreateChat={onCreateChat} />
    <div className="flex-1 overflow-y-auto">
      <ChatList chats={chats} activeChatId={activeChatId} onSelectChat={onSelectChat} />
    </div>
  </aside>
)

export default Sidebar
