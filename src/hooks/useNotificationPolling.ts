import { useEffect, useRef, useState } from 'react'
import { deleteNotification, parseNotification, receiveNotification } from '../api/greenApi'
import type { ChatEvent, Credentials } from '../types'

export type ConnectionStatus = 'connecting' | 'online' | 'error'

const RETRY_DELAYS_MS = [3_000, 5_000, 10_000, 30_000]

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve) => {
    const timeoutId = setTimeout(resolve, ms)
    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timeoutId)
        resolve()
      },
      { once: true },
    )
  })

export const useNotificationPolling = (
  credentials: Credentials,
  onEvent: (chatEvent: ChatEvent) => void,
) => {
  const [status, setStatus] = useState<ConnectionStatus>('connecting')
  const onEventRef = useRef(onEvent)

  useEffect(() => {
    onEventRef.current = onEvent
  }, [onEvent])

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller
    let failedAttempts = 0

    const poll = async () => {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, signal)
          failedAttempts = 0
          setStatus('online')
          if (!notification) continue

          const chatEvent = notification.body ? parseNotification(notification.body) : null
          if (chatEvent) onEventRef.current(chatEvent)
          await deleteNotification(credentials, notification.receiptId, signal)
        } catch {
          if (signal.aborted) return
          setStatus('error')
          const delay = RETRY_DELAYS_MS[Math.min(failedAttempts, RETRY_DELAYS_MS.length - 1)]
          failedAttempts += 1
          await wait(delay, signal)
        }
      }
    }

    void poll()
    return () => controller.abort()
  }, [credentials])

  return status
}
