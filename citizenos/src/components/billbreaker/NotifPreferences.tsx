import { useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { useNotifStore } from '@/stores/useNotifStore'
import { CATEGORIES } from '@/lib/categories'

const NOTIFICATION_TYPES = [
  { key: 'bill_alerts', label: 'Bill Alerts', description: 'New bills matching your profile and interests' },
  { key: 'action_alerts', label: 'Government Actions', description: 'Executive orders, rules, and rulings that affect you' },
  { key: 'status_changes', label: 'Status Changes', description: 'When tracked bills or actions change status' },
  { key: 'rep_votes', label: 'Representative Votes', description: 'When your reps vote on bills' },
]

const DELIVERY_OPTIONS = [
  { key: 'push_notifications', label: 'Push Notifications', description: 'Browser push notifications' },
  { key: 'email_digest', label: 'Email Digest', description: 'Weekly email summary' },
  { key: 'high_impact_only', label: 'High Impact Only', description: 'Only notify for high-impact bills' },
]

export default function NotifPreferences() {
  const preferences = useNotifStore((s) => s.preferences)
  const fetchPreferences = useNotifStore((s) => s.fetchPreferences)
  const updatePreferences = useNotifStore((s) => s.updatePreferences)

  useEffect(() => {
    fetchPreferences()
  }, [fetchPreferences])

  const handleToggle = (key: string, checked: boolean) => {
    updatePreferences({ [key]: checked })
  }

  return (
    <div className="space-y-6">
      {/* Notification Types */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Notification Types</h3>
        <div className="space-y-4">
          {NOTIFICATION_TYPES.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={preferences[item.key] ?? false}
                onCheckedChange={(checked) => handleToggle(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Categories */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Categories</h3>
        <p className="text-xs text-muted-foreground mb-4">
          Choose which policy areas you want to receive notifications for.
        </p>
        <div className="grid grid-cols-2 gap-4">
          {CATEGORIES.map((cat) => {
            const key = `cat_${cat.id}`
            return (
              <div key={cat.id} className="flex items-center justify-between">
                <span className="text-sm">{cat.label}</span>
                <Switch
                  checked={preferences[key] ?? true}
                  onCheckedChange={(checked) => handleToggle(key, checked)}
                />
              </div>
            )
          })}
        </div>
      </div>

      <Separator />

      {/* Delivery */}
      <div>
        <h3 className="text-sm font-semibold mb-3">Delivery</h3>
        <div className="space-y-4">
          {DELIVERY_OPTIONS.map((item) => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.description}</p>
              </div>
              <Switch
                checked={preferences[item.key] ?? false}
                onCheckedChange={(checked) => handleToggle(item.key, checked)}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
