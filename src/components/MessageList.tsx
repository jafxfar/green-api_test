import { useEffect, useRef } from 'react'
import type { Message } from '../types'
import MessageBubble from './MessageBubble'

type MessageListProps = {
  messages: Message[]
  onRetry: (message: Message) => void
}

const MessageList = ({ messages, onRetry }: MessageListProps) => {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.scrollTop = container.scrollHeight
  }, [messages])

  return (
    <div ref={containerRef} className="flex-1 overflow-y-auto px-4 py-4 md:px-8">
      {messages.length === 0 ? (
        <div className="flex h-full items-center justify-center">
          <p className="rounded-full bg-white/70 px-4 py-2 text-sm text-slate-500">
            Напишите первое сообщение
          </p>
        </div>
      ) : (
        <ul className="mx-auto flex max-w-3xl flex-col gap-1.5" aria-label="Сообщения" aria-live="polite">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} onRetry={onRetry} />
          ))}
        </ul>
      )}
    </div>
  )
}

export default MessageList
