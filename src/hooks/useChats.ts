import { useCallback, useEffect, useMemo, useReducer } from 'react'
import type { Chat, ChatEvent, IncomingTextMessage, Message, MessageStatus, OutgoingMessageEvent } from '../types'
import { formatPhone } from '../utils/phone'

type ChatsState = {
  chats: Chat[]
  activeChatId: string | null
}

type ChatsAction =
  | { type: 'createChat'; phone: string }
  | { type: 'selectChat'; chatId: string | null }
  | { type: 'addOutgoing'; chatId: string; message: Message }
  | { type: 'updateMessage'; chatId: string; localId: string; id?: string; status: MessageStatus }
  | { type: 'addIncoming'; message: IncomingTextMessage }
  | { type: 'applyOutgoingEvent'; event: OutgoingMessageEvent }

const getStorageKey = (idInstance: string) => `chats:${idInstance}`

const isChatArray = (value: unknown): value is Chat[] =>
  Array.isArray(value) &&
  value.every((chat) => chat && typeof chat.id === 'string' && Array.isArray(chat.messages))

const loadChats = (idInstance: string): ChatsState => {
  try {
    const raw = localStorage.getItem(getStorageKey(idInstance))
    const parsed: unknown = raw ? JSON.parse(raw) : []
    if (!isChatArray(parsed)) return { chats: [], activeChatId: null }
    const chats = parsed.map((chat) => ({
      ...chat,
      messages: chat.messages.map((message) =>
        message.status === 'sending' ? { ...message, status: 'error' as const } : message,
      ),
    }))
    return { chats, activeChatId: null }
  } catch {
    return { chats: [], activeChatId: null }
  }
}

const createEmptyChat = (id: string, phone: string, title: string): Chat => ({
  id,
  phone,
  title,
  messages: [],
  unread: 0,
  createdAt: Date.now(),
})

const updateChat = (chats: Chat[], chatId: string, update: (chat: Chat) => Chat) =>
  chats.map((chat) => (chat.id === chatId ? update(chat) : chat))

const insertMessage = (messages: Message[], message: Message) =>
  [...messages, message].sort((a, b) => a.timestamp - b.timestamp)

const findChatForIncoming = (chats: Chat[], { tgChatId, phone }: IncomingTextMessage) =>
  chats.find((chat) => chat.tgChatId === tgChatId) ?? (phone ? chats.find((chat) => chat.phone === phone) : undefined)

const handleIncoming = (state: ChatsState, incoming: IncomingTextMessage): ChatsState => {
  const message: Message = {
    id: incoming.idMessage,
    text: incoming.text,
    direction: 'in',
    timestamp: incoming.timestamp,
    status: 'sent',
  }

  const existingChat = findChatForIncoming(state.chats, incoming)
  const chat =
    existingChat ??
    createEmptyChat(
      incoming.phone ?? `tg:${incoming.tgChatId}`,
      incoming.phone ?? '',
      incoming.senderName || (incoming.phone ? formatPhone(incoming.phone) : incoming.tgChatId),
    )

  if (chat.messages.some((item) => item.id === message.id)) return state

  const isActive = state.activeChatId === chat.id
  const hasDefaultTitle = !chat.phone || chat.title === formatPhone(chat.phone)
  const updatedChat: Chat = {
    ...chat,
    tgChatId: incoming.tgChatId,
    title: hasDefaultTitle && incoming.senderName ? incoming.senderName : chat.title,
    messages: insertMessage(chat.messages, message),
    unread: isActive ? 0 : chat.unread + 1,
  }

  const chats = existingChat
    ? updateChat(state.chats, chat.id, () => updatedChat)
    : [updatedChat, ...state.chats]
  return { ...state, chats }
}

const handleOutgoingEvent = (state: ChatsState, { idMessage, tgChatId, isFailed }: OutgoingMessageEvent): ChatsState => {
  const chat = state.chats.find((item) => item.messages.some((message) => message.id === idMessage))
  if (!chat) return state

  const shouldLink = Boolean(tgChatId) && !chat.tgChatId
  if (!shouldLink && !isFailed) return state

  return {
    ...state,
    chats: updateChat(state.chats, chat.id, (current) => ({
      ...current,
      tgChatId: current.tgChatId ?? tgChatId,
      messages: isFailed
        ? current.messages.map((message) => (message.id === idMessage ? { ...message, status: 'error' } : message))
        : current.messages,
    })),
  }
}

const chatsReducer = (state: ChatsState, action: ChatsAction): ChatsState => {
  switch (action.type) {
    case 'createChat': {
      const exists = state.chats.some((chat) => chat.id === action.phone)
      if (exists) return { ...state, activeChatId: action.phone }
      const chat = createEmptyChat(action.phone, action.phone, formatPhone(action.phone))
      return { chats: [chat, ...state.chats], activeChatId: chat.id }
    }
    case 'selectChat':
      return {
        activeChatId: action.chatId,
        chats: action.chatId
          ? updateChat(state.chats, action.chatId, (chat) => ({ ...chat, unread: 0 }))
          : state.chats,
      }
    case 'addOutgoing':
      return {
        ...state,
        chats: updateChat(state.chats, action.chatId, (chat) => ({
          ...chat,
          messages: insertMessage(chat.messages, action.message),
        })),
      }
    case 'updateMessage':
      return {
        ...state,
        chats: updateChat(state.chats, action.chatId, (chat) => ({
          ...chat,
          messages: chat.messages.map((message) =>
            message.id === action.localId
              ? { ...message, id: action.id ?? message.id, status: action.status }
              : message,
          ),
        })),
      }
    case 'addIncoming':
      return handleIncoming(state, action.message)
    case 'applyOutgoingEvent':
      return handleOutgoingEvent(state, action.event)
    default:
      return state
  }
}

const getLastActivity = (chat: Chat) => chat.messages.at(-1)?.timestamp ?? chat.createdAt

export const useChats = (idInstance: string) => {
  const [state, dispatch] = useReducer(chatsReducer, idInstance, loadChats)

  useEffect(() => {
    try {
      localStorage.setItem(getStorageKey(idInstance), JSON.stringify(state.chats))
    } catch {
      // Storage may be full or disabled; the chat keeps working in memory.
    }
  }, [idInstance, state.chats])

  const sortedChats = useMemo(
    () => [...state.chats].sort((a, b) => getLastActivity(b) - getLastActivity(a)),
    [state.chats],
  )

  const activeChat = useMemo(
    () => state.chats.find((chat) => chat.id === state.activeChatId) ?? null,
    [state.chats, state.activeChatId],
  )

  const createChat = useCallback((phone: string) => dispatch({ type: 'createChat', phone }), [])

  const selectChat = useCallback((chatId: string | null) => dispatch({ type: 'selectChat', chatId }), [])

  const addOutgoing = useCallback(
    (chatId: string, message: Message) => dispatch({ type: 'addOutgoing', chatId, message }),
    [],
  )

  const updateMessage = useCallback(
    (chatId: string, localId: string, status: MessageStatus, id?: string) =>
      dispatch({ type: 'updateMessage', chatId, localId, status, id }),
    [],
  )

  const applyEvent = useCallback((chatEvent: ChatEvent) => {
    if (chatEvent.type === 'incoming') {
      dispatch({ type: 'addIncoming', message: chatEvent.message })
      return
    }
    dispatch({ type: 'applyOutgoingEvent', event: chatEvent.event })
  }, [])

  return {
    chats: sortedChats,
    activeChat,
    createChat,
    selectChat,
    addOutgoing,
    updateMessage,
    applyEvent,
  }
}
