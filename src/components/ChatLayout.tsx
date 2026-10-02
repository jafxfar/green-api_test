import { sendMessage } from '../api/greenApi'
import { useChats } from '../hooks/useChats'
import { useNotificationPolling } from '../hooks/useNotificationPolling'
import type { Chat, Credentials, Message } from '../types'
import { toChatId } from '../utils/phone'
import ChatWindow from './ChatWindow'
import EmptyState from './EmptyState'
import Sidebar from './Sidebar'

type ChatLayoutProps = {
  credentials: Credentials
  onLogout: () => void
}

const getRecipientId = (chat: Chat) => chat.tgChatId ?? toChatId(chat.phone)

const ChatLayout = ({ credentials, onLogout }: ChatLayoutProps) => {
  const { chats, activeChat, createChat, selectChat, addOutgoing, updateMessage, applyEvent } = useChats(
    credentials.idInstance,
  )
  const connectionStatus = useNotificationPolling(credentials, applyEvent)

  const deliver = async (chat: Chat, localId: string, text: string) => {
    try {
      const { idMessage } = await sendMessage(credentials, getRecipientId(chat), text)
      updateMessage(chat.id, localId, 'sent', idMessage)
    } catch {
      updateMessage(chat.id, localId, 'error')
    }
  }

  const handleSend = (chat: Chat, text: string) => {
    const localId = crypto.randomUUID()
    addOutgoing(chat.id, { id: localId, text, direction: 'out', timestamp: Date.now(), status: 'sending' })
    void deliver(chat, localId, text)
  }

  const handleRetry = (chat: Chat, message: Message) => {
    updateMessage(chat.id, message.id, 'sending')
    void deliver(chat, message.id, message.text)
  }

  const handleBack = () => selectChat(null)

  return (
    <div className="flex h-full overflow-hidden">
      <div className={`h-full w-full md:flex md:w-auto ${activeChat ? 'hidden' : 'flex'}`}>
        <Sidebar
          chats={chats}
          activeChatId={activeChat?.id ?? null}
          idInstance={credentials.idInstance}
          connectionStatus={connectionStatus}
          onSelectChat={selectChat}
          onCreateChat={createChat}
          onLogout={onLogout}
        />
      </div>
      {activeChat ? (
        <ChatWindow chat={activeChat} onSend={handleSend} onRetry={handleRetry} onBack={handleBack} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

export default ChatLayout
