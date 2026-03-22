import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { US_STATES } from '@/lib/states'
import { CATEGORIES } from '@/lib/categories'
import {
  VISA_OPTIONS,
  EMPLOYMENT_OPTIONS,
  AGE_OPTIONS,
  HOUSEHOLD_OPTIONS,
} from '@/lib/profileOptions'
import PageWrapper from '@/components/layout/PageWrapper'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { AlertCircle, Loader2, MapPin, UserCog, Home, Tags, Check } from 'lucide-react'

const STEPS = [
  { label: 'Location', icon: MapPin },
  { label: 'Background', icon: UserCog },
  { label: 'Life Situation', icon: Home },
  { label: 'Issues', icon: Tags },
] as const

function ChipToggle({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-all duration-150 cursor-pointer ${
        selected
          ? 'bg-primary text-primary-foreground border-primary shadow-sm'
          : 'bg-background text-foreground border-border hover:bg-muted hover:border-muted-foreground/30'
      }`}
    >
      {selected && <Check className="h-3.5 w-3.5" />}
      {label}
    </button>
  )
}

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const saveOnboarding = useAuthStore((s) => s.saveOnboarding)

  const [step, setStep] = useState(0)

  // Step 1: Location
  const [stateCode, setStateCode] = useState('')
  const [zipCode, setZipCode] = useState('')

  // Step 2: Background
  const [visaStatus, setVisaStatus] = useState('')
  const [employmentStatus, setEmploymentStatus] = useState('')
  const [ageGroup, setAgeGroup] = useState('')

  // Step 3: Life situation
  const [household, setHousehold] = useState<string[]>([])

  // Step 4: Policy interests
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleHousehold(id: string) {
    setHousehold((prev) =>
      prev.includes(id) ? prev.filter((h) => h !== id) : [...prev, id]
    )
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function canProceed(): boolean {
    if (step === 0) return !!stateCode
    return true
  }

  function buildPersonas(): string[] {
    const personas: string[] = []
    if (['f1', 'f2', 'j1', 'j2', 'opt', 'cpt'].includes(visaStatus)) personas.push('student')
    if (['h1b', 'h4', 'l1', 'o1', 'tn', 'e2', 'ead'].includes(visaStatus)) personas.push('visa_holder')
    if (visaStatus === 'daca') personas.push('visa_holder')
    if (['military_active', 'military_veteran'].includes(employmentStatus)) personas.push('veteran')
    if (['self_employed'].includes(employmentStatus)) personas.push('small_business')
    if (['freelance_gig'].includes(employmentStatus)) personas.push('gig_worker')
    if (['student', 'student_working'].includes(employmentStatus)) personas.push('student')
    if (ageGroup === '65_plus') personas.push('senior')
    if (household.includes('parent')) personas.push('parent')
    if (household.includes('small_business')) personas.push('small_business')
    if (household.includes('uninsured')) personas.push('healthcare_worker')
    return [...new Set(personas)]
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      await saveOnboarding({
        state_code: stateCode,
        zip_code: zipCode,
        personas: buildPersonas(),
        categories: selectedCategories,
        visa_status: visaStatus || undefined,
        employment_status: employmentStatus || undefined,
        age_group: ageGroup || undefined,
        household: household.length > 0 ? household : undefined,
      })
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (step < STEPS.length - 1) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  function handleSkipAll() {
    navigate('/')
  }

  const StepIcon = STEPS[step].icon

  return (
    <PageWrapper className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-lg">
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => {
              const Icon = s.icon
              const isActive = i === step
              const isDone = i < step
              return (
                <div key={s.label} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-200 ${
                      isDone
                        ? 'bg-primary border-primary text-primary-foreground'
                        : isActive
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {isDone ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={`text-xs font-medium hidden sm:block ${
                      isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>
          {/* Progress bar */}
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                <StepIcon className="h-4.5 w-4.5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-xl">Personalize CitizenOS</CardTitle>
                <CardDescription className="text-xs">
                  Step {step + 1} of {STEPS.length} — {STEPS[step].label}
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="min-h-[300px]">
            {error && (
              <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4" role="alert">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Step 1: Location */}
            {step === 0 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-semibold">Where do you live?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    We'll show you state-specific legislation, your representatives, and local candidates.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">State <span className="text-destructive">*</span></label>
                  <Select value={stateCode} onValueChange={setStateCode}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select your state" />
                    </SelectTrigger>
                    <SelectContent>
                      {US_STATES.map((s) => (
                        <SelectItem key={s.code} value={s.code}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Zip Code <span className="text-muted-foreground font-normal">(optional)</span></label>
                  <Input
                    type="text"
                    placeholder="e.g. 85281"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                    maxLength={5}
                    inputMode="numeric"
                    className="h-11"
                  />
                  <p className="text-xs text-muted-foreground">
                    Helps us find your exact congressional district.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Background */}
            {step === 1 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-semibold">Your background</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    This helps us surface government actions that directly impact you.
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Immigration / Citizenship Status</label>
                  <Select value={visaStatus} onValueChange={setVisaStatus}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {VISA_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Employment Status</label>
                  <Select value={employmentStatus} onValueChange={setEmploymentStatus}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select employment" />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Age Group</label>
                  <Select value={ageGroup} onValueChange={setAgeGroup}>
                    <SelectTrigger className="w-full h-11">
                      <SelectValue placeholder="Select age range" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <p className="text-xs text-muted-foreground">
                  All fields are optional. Select "Prefer not to say" to skip any.
                </p>
              </div>
            )}

            {/* Step 3: Life situation */}
            {step === 2 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-semibold">Your life situation</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Select anything that applies. This helps us highlight relevant policies.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {HOUSEHOLD_OPTIONS.map((opt) => (
                    <ChipToggle
                      key={opt.id}
                      label={opt.label}
                      selected={household.includes(opt.id)}
                      onClick={() => toggleHousehold(opt.id)}
                    />
                  ))}
                </div>

                {household.length > 0 && (
                  <p className="text-sm text-primary font-medium">
                    {household.length} selected
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Policy interests */}
            {step === 3 && (
              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="text-lg font-semibold">What issues matter to you?</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Pick the policy areas you want to follow. We'll prioritize bills and actions in these areas.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((category) => (
                    <ChipToggle
                      key={category.id}
                      label={category.label}
                      selected={selectedCategories.includes(category.id)}
                      onClick={() => toggleCategory(category.id)}
                    />
                  ))}
                </div>

                {selectedCategories.length > 0 && (
                  <p className="text-sm text-primary font-medium">
                    {selectedCategories.length} selected
                  </p>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-4">
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={step === 0}
              >
                Back
              </Button>
              <Button
                variant="ghost"
                onClick={handleSkipAll}
                className="text-muted-foreground"
              >
                Skip for now
              </Button>
            </div>
            <Button
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className="min-w-[120px]"
            >
              {step === STEPS.length - 1 ? (
                loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Finish Setup'
                )
              ) : (
                'Next'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </PageWrapper>
  )
}
