import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/layout/Header'
import PageWrapper from '@/components/layout/PageWrapper'
import NotifPreferences from '@/components/billbreaker/NotifPreferences'
import { useAuthStore } from '@/stores/useAuthStore'

// Lazy-loaded route components
const MapView = React.lazy(() => import('@/components/map/USAMap'))
const BillDetailPage = React.lazy(() => import('@/components/billbreaker/BillDetailPage'))
const Dashboard = React.lazy(() => import('@/components/layout/Dashboard'))
const LoginForm = React.lazy(() => import('@/components/auth/LoginForm'))
const SignupForm = React.lazy(() => import('@/components/auth/SignupForm'))
const OnboardingFlow = React.lazy(() => import('@/components/auth/OnboardingFlow'))
const VoteMapPage = React.lazy(() => import('@/components/votemap/VoteMapPage'))

// Simple placeholder pages
function RepScoreDashboard() {
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-2">RepScore Dashboard</h1>
      <p className="text-muted-foreground">Representative scorecards coming soon.</p>
    </PageWrapper>
  )
}

function RepDetail() {
  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-2">Rep Detail</h1>
      <p className="text-muted-foreground">Individual representative detail page coming soon.</p>
    </PageWrapper>
  )
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
      <Suspense fallback={<LoadingFallback />}>
        <Outlet />
      </Suspense>
      <Toaster />
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
        <Route path="/" element={<MapView />} />
        <Route path="/bill/:id" element={<BillDetailPage />} />
        <Route path="/reps" element={<RepScoreDashboard />} />
        <Route path="/rep/:memberId" element={<RepDetail />} />
        <Route path="/vote" element={<VoteMapPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
      </Route>
    </Routes>
  )
}
