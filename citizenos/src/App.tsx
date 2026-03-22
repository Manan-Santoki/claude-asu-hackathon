import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/layout/Header'
import OnboardingBanner from '@/components/layout/OnboardingBanner'
import PageWrapper from '@/components/layout/PageWrapper'
import NotifPreferences from '@/components/billbreaker/NotifPreferences'
import { useAuthStore } from '@/stores/useAuthStore'
import DemoOverlay from '@/components/demo/DemoOverlay'

// Lazy-loaded route components
const MapView = React.lazy(() => import('@/components/map/USAMap'))
const LandingPage = React.lazy(() => import('@/components/layout/LandingPage'))
const BillDetailPage = React.lazy(() => import('@/components/billbreaker/BillDetailPage'))
const RepScoreDashboard = React.lazy(() => import('@/components/repscore/RepScoreDashboard'))
const RepDetailPage = React.lazy(() => import('@/components/repscore/RepDetailPage'))
const Dashboard = React.lazy(() => import('@/components/layout/Dashboard'))
const LoginForm = React.lazy(() => import('@/components/auth/LoginForm'))
const SignupForm = React.lazy(() => import('@/components/auth/SignupForm'))
const OnboardingFlow = React.lazy(() => import('@/components/auth/OnboardingFlow'))
const ProfilePage = React.lazy(() => import('@/components/auth/ProfilePage'))
const VoteMapPage = React.lazy(() => import('@/components/votemap/VoteMapPage'))
const CandidateDetail = React.lazy(() => import('@/components/votemap/CandidateDetail'))
const ActionSearchPage = React.lazy(() => import('@/components/actions/ActionSearchPage'))
const ActionDetailPage = React.lazy(() => import('@/components/actions/ActionDetailPage'))

function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <MapView /> : <LandingPage />
}

function SettingsPage() {
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-6">Settings</h1>
      <NotifPreferences />
    </PageWrapper>
  )
}

// Loading fallback
function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="animate-pulse text-muted-foreground">Loading...</div>
    </div>
  )
}

// Layout wrapper that includes Header + Outlet
function RootLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <OnboardingBanner />
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
      <Toaster />
      <DemoOverlay />
    </div>
  )
}

export default function App() {
  const loadProfile = useAuthStore((s) => s.loadProfile)

  useEffect(() => {
    loadProfile()
  }, [loadProfile])
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<MapView />} />
        <Route path="/bill/:id" element={<BillDetailPage />} />
        <Route path="/reps" element={<RepScoreDashboard />} />
        <Route path="/rep/:memberId" element={<RepDetailPage />} />
        <Route path="/vote" element={<VoteMapPage />} />
        <Route path="/candidate/:id" element={<CandidateDetail />} />
        <Route path="/actions" element={<ActionSearchPage />} />
        <Route path="/action/:id" element={<ActionDetailPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
      </Route>
    </Routes>
  )
}
