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

const STEPS = ['Location', 'Background', 'Life Situation', 'Issues'] as const

// --- Chip toggle helper ---

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
      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border transition-colors cursor-pointer ${
        selected
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-background text-foreground border-border hover:bg-accent'
      }`}
    >
      {label}
    </button>
  )
}

// --- Main component ---

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

  // All steps are optional except we need at least something useful
  function canProceed(): boolean {
    if (step === 0) return !!stateCode
    return true
  }

  // Build personas from the structured data for backward compatibility
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
    // Deduplicate
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

  return (
    <PageWrapper className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Personalize CitizenOS</CardTitle>
          <CardDescription>
            Tell us about yourself so we can show you the bills, orders, and policies that directly affect your life. You can skip this and complete it later.
          </CardDescription>
          {/* Step indicator */}
          <div className="flex justify-center gap-2 pt-3">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`h-2 flex-1 max-w-16 rounded-full transition-colors ${
                  i <= step ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground pt-1">
            Step {step + 1} of {STEPS.length} — {STEPS[step]}
          </p>
        </CardHeader>

        <CardContent className="min-h-[320px]">
          {error && (
            <div className="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Location */}
          {step === 0 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-semibold">Where do you live?</h3>
              <p className="text-sm text-muted-foreground -mt-3">
                We'll show you state-specific legislation, your representatives, and local candidates.
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">State</label>
                <Select value={stateCode} onValueChange={setStateCode}>
                  <SelectTrigger className="w-full">
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
                <label className="text-sm font-medium">Zip Code (optional)</label>
                <Input
                  type="text"
                  placeholder="e.g. 85281"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                  inputMode="numeric"
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
              <h3 className="text-lg font-semibold">Your background</h3>
              <p className="text-sm text-muted-foreground -mt-3">
                This helps us surface government actions that directly impact you. For example, H-1B visa holders see fee changes and immigration rules; students see financial aid and visa policies.
              </p>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium">Immigration / Citizenship Status</label>
                <Select value={visaStatus} onValueChange={setVisaStatus}>
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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
                  <SelectTrigger className="w-full">
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
              <h3 className="text-lg font-semibold">Your life situation</h3>
              <p className="text-sm text-muted-foreground -mt-3">
                Select anything that applies. This helps us highlight policies on housing, healthcare, education costs, and benefits that matter to you.
              </p>

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
                <p className="text-xs text-muted-foreground">
                  {household.length} selected
                </p>
              )}
            </div>
          )}

          {/* Step 4: Policy interests */}
          {step === 3 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-semibold">What issues matter to you?</h3>
              <p className="text-sm text-muted-foreground -mt-3">
                Pick the policy areas you want to follow. We'll prioritize bills and actions in these areas.
              </p>

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
                <p className="text-xs text-muted-foreground">
                  {selectedCategories.length} selected
                </p>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
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
          >
            {step === STEPS.length - 1
              ? loading
                ? 'Saving...'
                : 'Finish Setup'
              : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </PageWrapper>
  )
}
