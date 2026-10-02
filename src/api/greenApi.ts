import type {
  ChatEvent,
  Credentials,
  OutgoingMessageEvent,
  DeleteNotificationResponse,
  ExtendedTextMessageData,
  IncomingMessageWebhook,
  IncomingTextMessage,
  TextMessageData,
  NotificationBody,
  ReceiveNotificationResponse,
  SendMessageResponse,
  StateInstanceResponse,
} from '../types'

const DEFAULT_API_URL = 'https://api.green-api.com'
const REQUEST_TIMEOUT_MS = 15_000
const RECEIVE_TIMEOUT_SEC = 5

export class GreenApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

export const deriveApiUrl = (idInstance: string) => {
  const digits = idInstance.replace(/\D/g, '')
  if (digits.length < 4) return DEFAULT_API_URL
  return `https://${digits.slice(0, 4)}.api.green-api.com`
}

export const isValidApiUrl = (value: string) => {
  try {
    const url = new URL(value)
    const isGreenApiHost = url.hostname === 'green-api.com' || url.hostname.endsWith('.green-api.com')
    return url.protocol === 'https:' && isGreenApiHost
  } catch {
    return false
  }
}

const buildUrl = ({ apiUrl, idInstance, apiTokenInstance }: Credentials, method: string, suffix = '') => {
  const base = apiUrl.replace(/\/+$/, '')
  return `${base}/waInstance${encodeURIComponent(idInstance)}/${method}/${encodeURIComponent(apiTokenInstance)}${suffix}`
}

const getErrorMessage = (status: number) => {
  if (status === 401 || status === 403) return 'Неверный idInstance или apiTokenInstance'
  if (status === 429) return 'Слишком много запросов, попробуйте позже'
  if (status === 466) return 'Исчерпан лимит запросов по тарифу инстанса'
  if (status >= 500) return 'Сервер GREEN-API временно недоступен'
  return `Ошибка запроса (${status})`
}

const request = async <T>(url: string, init: RequestInit = {}, externalSignal?: AbortSignal): Promise<T> => {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS)
  const signal = externalSignal ? AbortSignal.any([externalSignal, timeoutSignal]) : timeoutSignal

  let response: Response
  try {
    response = await fetch(url, { ...init, signal })
  } catch (error) {
    if (externalSignal?.aborted) throw error
    if (timeoutSignal.aborted) throw new GreenApiError('Превышено время ожидания ответа', 0)
    throw new GreenApiError('Нет соединения с GREEN-API', 0)
  }

  if (!response.ok) throw new GreenApiError(getErrorMessage(response.status), response.status)

  const text = await response.text()
  if (!text) return null as T
  return JSON.parse(text) as T
}

export const getStateInstance = (credentials: Credentials) =>
  request<StateInstanceResponse>(buildUrl(credentials, 'getStateInstance'))

export const sendMessage = (credentials: Credentials, chatId: string, message: string) =>
  request<SendMessageResponse>(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })

export const receiveNotification = (credentials: Credentials, signal?: AbortSignal) =>
  request<ReceiveNotificationResponse>(
    buildUrl(credentials, 'receiveNotification', `?receiveTimeout=${RECEIVE_TIMEOUT_SEC}`),
    {},
    signal,
  )

export const deleteNotification = (credentials: Credentials, receiptId: number, signal?: AbortSignal) =>
  request<DeleteNotificationResponse>(
    buildUrl(credentials, 'deleteNotification', `/${encodeURIComponent(receiptId)}`),
    { method: 'DELETE' },
    signal,
  )

const extractText = (messageData: IncomingMessageWebhook['messageData']) => {
  if (messageData.typeMessage === 'textMessage') {
    return (messageData as TextMessageData).textMessageData?.textMessage ?? null
  }
  if (messageData.typeMessage === 'extendedTextMessage') {
    return (messageData as ExtendedTextMessageData).extendedTextMessageData?.text ?? null
  }
  return null
}

const OUTGOING_WEBHOOK_TYPES = ['outgoingAPIMessageReceived', 'outgoingMessageStatus']

const parseOutgoingEvent = (body: NotificationBody): OutgoingMessageEvent | null => {
  if (!OUTGOING_WEBHOOK_TYPES.includes(body.typeWebhook)) return null

  const { idMessage, chatId, senderData, status } = body as {
    idMessage?: unknown
    chatId?: unknown
    senderData?: { chatId?: unknown }
    status?: unknown
  }
  if (typeof idMessage !== 'string') return null

  const rawChatId = body.typeWebhook === 'outgoingMessageStatus' ? chatId : senderData?.chatId
  const isTelegramId = typeof rawChatId === 'string' && rawChatId.length > 0 && !rawChatId.endsWith('@c.us')

  return {
    idMessage,
    tgChatId: isTelegramId ? rawChatId : undefined,
    isFailed: status === 'failed',
  }
}

const parseIncomingTextMessage = (body: NotificationBody): IncomingTextMessage | null => {
  if (body.typeWebhook !== 'incomingMessageReceived') return null

  const { messageData, senderData, idMessage, timestamp } = body as IncomingMessageWebhook
  if (!messageData || !senderData?.chatId || !idMessage) return null

  const text = extractText(messageData)
  if (typeof text !== 'string' || !text.trim()) return null

  return {
    idMessage,
    text,
    timestamp: timestamp * 1000,
    tgChatId: senderData.chatId,
    phone: senderData.senderPhoneNumber ? String(senderData.senderPhoneNumber) : undefined,
    senderName: senderData.senderContactName || senderData.senderName || senderData.chatName,
  }
}

export const parseNotification = (body: NotificationBody): ChatEvent | null => {
  const message = parseIncomingTextMessage(body)
  if (message) return { type: 'incoming', message }
  const event = parseOutgoingEvent(body)
  if (event) return { type: 'outgoing', event }
  return null
}
