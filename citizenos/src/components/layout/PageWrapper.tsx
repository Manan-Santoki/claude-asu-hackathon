import type { ReactNode } from 'react'

interface PageWrapperProps {
  children: ReactNode
  className?: string
}

export default function PageWrapper({ children, className = '' }: PageWrapperProps) {
  return (
    <main className={`mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </main>
  )
}
