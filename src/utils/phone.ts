const MIN_PHONE_LENGTH = 10
const MAX_PHONE_LENGTH = 15

export const normalizePhone = (value: string): string | null => {
  const digits = value.replace(/\D/g, '')
  if (digits.length < MIN_PHONE_LENGTH || digits.length > MAX_PHONE_LENGTH) return null
  if (digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`
  return digits
}

export const toChatId = (phone: string) => `${phone}@c.us`

export const formatPhone = (phone: string) => {
  if (phone.length === 11 && phone.startsWith('7')) {
    return `+7 ${phone.slice(1, 4)} ${phone.slice(4, 7)}-${phone.slice(7, 9)}-${phone.slice(9)}`
  }
  return `+${phone}`
}
