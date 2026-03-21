import { useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from '@/components/ui/popover'
import { useNotifStore } from '@/stores/useNotifStore'
import NotificationDropdown from './NotificationDropdown'

export default function NotificationBell() {
  const unreadCount = useNotifStore((s) => s.unreadCount)
  const startPolling = useNotifStore((s) => s.startPolling)
  const fetchNotifications = useNotifStore((s) => s.fetchNotifications)

  useEffect(() => {
    fetchNotifications()
    const stopPolling = startPolling()
    return stopPolling
  }, [startPolling, fetchNotifications])

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[380px] p-0">
        <NotificationDropdown />
      </PopoverContent>
    </Popover>
  )
}
