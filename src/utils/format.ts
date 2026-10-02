const timeFormatter = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: '2-digit' })

export const formatTime = (timestamp: number) => timeFormatter.format(timestamp)

export const formatChatDate = (timestamp: number) => {
  const isToday = new Date(timestamp).toDateString() === new Date().toDateString()
  return isToday ? timeFormatter.format(timestamp) : dateFormatter.format(timestamp)
}

export const getInitials = (title: string) => {
  const letters = title
    .split(/\s+/)
    .filter((word) => /\p{L}/u.test(word))
    .slice(0, 2)
    .map((word) => word.match(/\p{L}/u)?.[0] ?? '')
    .join('')
  return (letters || title.replace(/\D/g, '').slice(-2) || '?').toUpperCase()
}

const AVATAR_COLORS = [
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-teal-500',
  'from-amber-400 to-orange-500',
  'from-rose-400 to-pink-500',
  'from-cyan-400 to-sky-500',
]

export const getAvatarColor = (seed: string) => {
  const hash = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}
