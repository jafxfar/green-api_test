import { getAvatarColor, getInitials } from '../utils/format'

type AvatarProps = {
  seed: string
  title: string
  size?: 'md' | 'lg'
}

const SIZE_CLASSES = {
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
}

const Avatar = ({ seed, title, size = 'lg' }: AvatarProps) => (
  <div
    className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-semibold text-white ${SIZE_CLASSES[size]} ${getAvatarColor(seed)}`}
    aria-hidden="true"
  >
    {getInitials(title)}
  </div>
)

export default Avatar
