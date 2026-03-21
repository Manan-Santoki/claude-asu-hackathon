import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/stores/useAuthStore'
import { US_STATES } from '@/lib/states'
import { PERSONAS } from '@/lib/personas'
import { CATEGORIES } from '@/lib/categories'
import PageWrapper from '@/components/layout/PageWrapper'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const STEPS = ['Location', 'Profile', 'Interests'] as const

export default function OnboardingFlow() {
  const navigate = useNavigate()
  const saveOnboarding = useAuthStore((s) => s.saveOnboarding)

  const [step, setStep] = useState(0)
  const [stateCode, setStateCode] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [selectedProfiles, setSelectedProfiles] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function toggleProfile(id: string) {
    setSelectedProfiles((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    )
  }

  function toggleCategory(id: string) {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  function canProceed(): boolean {
    if (step === 0) return !!stateCode && !!zipCode
    if (step === 1) return selectedProfiles.length > 0
    if (step === 2) return selectedCategories.length > 0
    return false
  }

  async function handleSubmit() {
    setError('')
    setLoading(true)
    try {
      await saveOnboarding(stateCode, zipCode, selectedProfiles, selectedCategories)
      navigate('/')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save preferences')
    } finally {
      setLoading(false)
    }
  }

  function handleNext() {
    if (step < 2) {
      setStep(step + 1)
    } else {
      handleSubmit()
    }
  }

  function handleBack() {
    if (step > 0) setStep(step - 1)
  }

  return (
    <PageWrapper className="flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to CitizenOS</CardTitle>
          <CardDescription>
            Let us personalize your experience — step {step + 1} of {STEPS.length}
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
        </CardHeader>

        <CardContent className="min-h-[280px]">
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
                This helps us show you relevant legislation and representatives.
              </p>

              <div className="flex flex-col gap-2">
                <label htmlFor="state" className="text-sm font-medium">
                  State
                </label>
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
                <label htmlFor="zip" className="text-sm font-medium">
                  Zip Code
                </label>
                <Input
                  id="zip"
                  type="text"
                  placeholder="e.g. 85281"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  maxLength={5}
                  inputMode="numeric"
                />
              </div>
            </div>
          )}

          {/* Step 2: Profile personas */}
          {step === 1 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-semibold">Who are you?</h3>
              <p className="text-sm text-muted-foreground -mt-3">
                Select all that apply. This helps us highlight policies that affect you.
              </p>

              <div className="flex flex-wrap gap-2">
                {PERSONAS.map((persona) => {
                  const isSelected = selectedProfiles.includes(persona.id)
                  return (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => toggleProfile(persona.id)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-accent'
                      }`}
                    >
                      {persona.label}
                    </button>
                  )
                })}
              </div>

              {selectedProfiles.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {selectedProfiles.length} selected
                </p>
              )}
            </div>
          )}

          {/* Step 3: Category interests */}
          {step === 2 && (
            <div className="flex flex-col gap-5">
              <h3 className="text-lg font-semibold">What matters to you?</h3>
              <p className="text-sm text-muted-foreground -mt-3">
                Pick the policy areas you care about most.
              </p>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((category) => {
                  const isSelected = selectedCategories.includes(category.id)
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-accent'
                      }`}
                    >
                      {category.label}
                    </button>
                  )
                })}
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
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
          >
            Back
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed() || loading}
          >
            {step === 2 ? (loading ? 'Saving...' : 'Get started') : 'Next'}
          </Button>
        </CardFooter>
      </Card>
    </PageWrapper>
  )
}
