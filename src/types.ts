export type Credentials = {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type MessageDirection = 'in' | 'out'

export type MessageStatus = 'sending' | 'sent' | 'error'

export type Message = {
  id: string
  text: string
  direction: MessageDirection
  timestamp: number
  status: MessageStatus
}

export type Chat = {
  id: string
  phone: string
  tgChatId?: string
  title: string
  messages: Message[]
  unread: number
  createdAt: number
}

export type InstanceState =
  | 'authorized'
  | 'notAuthorized'
  | 'blocked'
  | 'sleepMode'
  | 'starting'
  | 'yellowCard'

export type StateInstanceResponse = {
  stateInstance: InstanceState
}

export type SendMessageResponse = {
  idMessage: string
}

export type SenderData = {
  chatId: string
  chatName?: string
  sender: string
  senderName?: string
  senderContactName?: string
  senderPhoneNumber?: number
}

export type TextMessageData = {
  typeMessage: 'textMessage'
  textMessageData?: { textMessage: string }
}

export type ExtendedTextMessageData = {
  typeMessage: 'extendedTextMessage'
  extendedTextMessageData?: { text: string }
}

export type IncomingMessageData =
  | TextMessageData
  | ExtendedTextMessageData
  | {
      typeMessage: string
    }

export type IncomingMessageWebhook = {
  typeWebhook: 'incomingMessageReceived'
  timestamp: number
  idMessage: string
  senderData: SenderData
  messageData: IncomingMessageData
}

export type NotificationBody =
  | IncomingMessageWebhook
  | {
      typeWebhook: string
      [key: string]: unknown
    }

export type ReceiveNotificationResponse = {
  receiptId: number
  body: NotificationBody
} | null

export type DeleteNotificationResponse = {
  result: boolean
  reason?: string
}

export type IncomingTextMessage = {
  idMessage: string
  text: string
  timestamp: number
  tgChatId: string
  phone?: string
  senderName?: string
}

export type OutgoingMessageEvent = {
  idMessage: string
  tgChatId?: string
  isFailed: boolean
}

export type ChatEvent =
  | { type: 'incoming'; message: IncomingTextMessage }
  | { type: 'outgoing'; event: OutgoingMessageEvent }
