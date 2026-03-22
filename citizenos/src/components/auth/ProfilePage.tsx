import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  MapPin,
  Briefcase,
  Globe,
  Calendar,
  Home,
  Tag,
  Pencil,
  Check,
  X,
  Sparkles,
} from 'lucide-react'
import PageWrapper from '@/components/layout/PageWrapper'
import { useAuthStore } from '@/stores/useAuthStore'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { US_STATES, getStateByCode } from '@/lib/states'
import { CATEGORIES, getCategoryById } from '@/lib/categories'
import {
  VISA_OPTIONS,
  EMPLOYMENT_OPTIONS,
  AGE_OPTIONS,
  HOUSEHOLD_OPTIONS,
  getVisaLabel,
  getEmploymentLabel,
  getAgeLabel,
  getHouseholdLabel,
} from '@/lib/profileOptions'

// --- Editable field components ---

function DisplayValue({ label, value, icon: Icon }: { label: string; value: string; icon: typeof MapPin }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  )
}

// --- Main component ---

export default function ProfilePage() {
  const { user, profiles, categories, saveOnboarding } = useAuthStore()

  const [editing, setEditing] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Edit state
  const [editState, setEditState] = useState(user?.state_code ?? '')
  const [editZip, setEditZip] = useState(user?.zip_code ?? '')
  const [editVisa, setEditVisa] = useState(user?.visa_status ?? '')
  const [editEmployment, setEditEmployment] = useState(user?.employment_status ?? '')
  const [editAge, setEditAge] = useState(user?.age_group ?? '')
  const [editHousehold, setEditHousehold] = useState<string[]>(user?.household ?? [])
  const [editCategories, setEditCategories] = useState<string[]>(categories)

  if (!user) {
    return (
      <PageWrapper>
        <p className="text-muted-foreground">Please log in to view your profile.</p>
      </PageWrapper>
    )
  }

  const initials = user.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  function startEdit(section: string) {
    // Reset edit state to current values
    setEditState(user?.state_code ?? '')
    setEditZip(user?.zip_code ?? '')
    setEditVisa(user?.visa_status ?? '')
    setEditEmployment(user?.employment_status ?? '')
    setEditAge(user?.age_group ?? '')
    setEditHousehold(user?.household ?? [])
    setEditCategories(categories)
    setEditing(section)
  }

  function cancelEdit() {
    setEditing(null)
  }

  async function saveSection() {
    setSaving(true)
    try {
      await saveOnboarding({
        state_code: editing === 'location' ? editState : (user?.state_code ?? ''),
        zip_code: editing === 'location' ? editZip : (user?.zip_code ?? ''),
        personas: profiles,
        categories: editing === 'interests' ? editCategories : categories,
        visa_status: editing === 'background' ? editVisa : user?.visa_status,
        employment_status: editing === 'background' ? editEmployment : user?.employment_status,
        age_group: editing === 'background' ? editAge : user?.age_group,
        household: editing === 'situation' ? editHousehold : user?.household,
      })
      setEditing(null)
    } catch {
      // Error handled silently for now
    } finally {
      setSaving(false)
    }
  }

  function toggleHousehold(id: string) {
    setEditHousehold((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    )
  }

  function toggleCategory(id: string) {
    setEditCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  const stateName = user.state_code ? getStateByCode(user.state_code)?.name ?? user.state_code : undefined

  return (
    <PageWrapper>
      {/* Header section */}
      <div className="relative rounded-xl border bg-gradient-to-r from-primary/5 via-card to-card p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar className="h-20 w-20 text-2xl ring-4 ring-background shadow-md">
            <AvatarFallback className="bg-primary/10 text-primary font-bold">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-2xl font-bold tracking-tight">{user.name || 'User'}</h1>
            <p className="text-muted-foreground">{user.email}</p>
            {!user?.onboarding_completed && (
              <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" />
                <span className="text-sm text-muted-foreground">Profile incomplete —</span>
                <Button asChild variant="link" size="sm" className="h-auto p-0 text-sm">
                  <Link to="/onboarding">Complete onboarding</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Location */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Location</CardTitle>
            {editing !== 'location' ? (
              <Button variant="ghost" size="sm" className="h-8" onClick={() => startEdit('location')}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" className="h-8 w-8" onClick={saveSection} disabled={saving}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editing === 'location' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">State</label>
                  <Select value={editState} onValueChange={setEditState}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Zip Code</label>
                  <Input
                    value={editZip}
                    onChange={(e) => setEditZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    placeholder="e.g. 85281"
                    maxLength={5}
                    inputMode="numeric"
                  />
                </div>
              </>
            ) : (
              <>
                <DisplayValue icon={MapPin} label="State" value={stateName ?? 'Not set'} />
                <DisplayValue icon={MapPin} label="Zip Code" value={user.zip_code || 'Not set'} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Background */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Background</CardTitle>
            {editing !== 'background' ? (
              <Button variant="ghost" size="sm" className="h-8" onClick={() => startEdit('background')}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" className="h-8 w-8" onClick={saveSection} disabled={saving}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {editing === 'background' ? (
              <>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Immigration / Citizenship Status</label>
                  <Select value={editVisa} onValueChange={setEditVisa}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISA_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Employment Status</label>
                  <Select value={editEmployment} onValueChange={setEditEmployment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground">Age Group</label>
                  <Select value={editAge} onValueChange={setEditAge}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <DisplayValue icon={Globe} label="Immigration / Citizenship" value={getVisaLabel(user.visa_status)} />
                <DisplayValue icon={Briefcase} label="Employment" value={getEmploymentLabel(user.employment_status)} />
                <DisplayValue icon={Calendar} label="Age Group" value={getAgeLabel(user.age_group)} />
              </>
            )}
          </CardContent>
        </Card>

        {/* Life Situation */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Life Situation</CardTitle>
            {editing !== 'situation' ? (
              <Button variant="ghost" size="sm" className="h-8" onClick={() => startEdit('situation')}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" className="h-8 w-8" onClick={saveSection} disabled={saving}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {editing === 'situation' ? (
              <div className="flex flex-wrap gap-2">
                {HOUSEHOLD_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleHousehold(opt.id)}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                      editHousehold.includes(opt.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {user.household && user.household.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <Home className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {user.household.map((id) => (
                        <Badge key={id} variant="secondary" className="text-xs">
                          {getHouseholdLabel(id)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Interests */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Policy Interests</CardTitle>
            {editing !== 'interests' ? (
              <Button variant="ghost" size="sm" className="h-8" onClick={() => startEdit('interests')}>
                <Pencil className="h-3.5 w-3.5 mr-1.5" />
                Edit
              </Button>
            ) : (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={cancelEdit} disabled={saving}>
                  <X className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" className="h-8 w-8" onClick={saveSection} disabled={saving}>
                  <Check className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {editing === 'interests' ? (
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleCategory(cat.id)}
                    className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium border transition-colors cursor-pointer ${
                      editCategories.includes(cat.id)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background text-foreground border-border hover:bg-accent'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {categories.length > 0 ? (
                  <div className="flex items-start gap-3">
                    <Tag className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex flex-wrap gap-1.5">
                      {categories.map((id) => {
                        const cat = getCategoryById(id)
                        return (
                          <Badge key={id} variant="secondary" className="text-xs">
                            {cat?.label ?? id}
                          </Badge>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Not set</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Account info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs text-muted-foreground">{user.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Onboarding</span>
            <Badge variant={user?.onboarding_completed ? 'default' : 'secondary'}>
              {user?.onboarding_completed ? 'Complete' : 'Incomplete'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  )
}
