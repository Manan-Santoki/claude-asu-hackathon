import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, Settings, Sun, Moon, UserCog, User } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { useThemeStore } from '@/stores/useThemeStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import NotificationBell from '@/components/billbreaker/NotificationBell'
import DemoButton from '@/components/demo/DemoButton'
import DemoBadge from '@/components/demo/DemoBadge'

function NavTabs({ onClick }: { onClick?: () => void }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)

  const navItems = isAuthenticated
    ? [
        { to: '/dashboard', label: 'Dashboard' },
        { to: '/map', label: 'Map' },
        { to: '/bill/latest', label: 'BillBreaker' },
        { to: '/reps', label: 'RepScore' },
        { to: '/actions', label: 'Actions' },
        { to: '/vote', label: 'VoteMap' },
      ]
    : [
        { to: '/', label: 'Home' },
        { to: '/map', label: 'Map' },
        { to: '/bill/latest', label: 'BillBreaker' },
        { to: '/reps', label: 'RepScore' },
        { to: '/actions', label: 'Actions' },
        { to: '/vote', label: 'VoteMap' },
      ]

  return (
    <>
      {navItems.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onClick}
          className={({ isActive }) =>
            `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-accent'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </>
  )
}

function SearchBar() {
  return (
    <Input
      type="text"
      placeholder="Search zip or city..."
      className="w-40 lg:w-56"
    />
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useThemeStore()
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </Button>
  )
}

function UserMenu() {
  const { user, isAuthenticated, logout } = useAuthStore()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return (
      <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
        Login
      </Button>
    )
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user?.name ?? 'User'}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate('/profile')}>
          <User className="mr-2 h-4 w-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => navigate('/dashboard')}>
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Dashboard
        </DropdownMenuItem>
        {!user?.onboarding_completed && (
          <DropdownMenuItem onClick={() => navigate('/onboarding')}>
            <UserCog className="mr-2 h-4 w-4" />
            Complete Profile
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => navigate('/settings')}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => {
            logout()
            navigate('/')
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 font-bold text-lg shrink-0">
          CitizenOS
        </NavLink>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 ml-6">
          <NavTabs />
        </nav>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Demo */}
        <DemoButton />
        <DemoBadge />

        {/* Search */}
        <div className="hidden sm:block">
          <SearchBar />
        </div>

        {/* Theme Toggle */}
        <ThemeToggle />

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Menu */}
        <UserMenu />

        {/* Mobile hamburger */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <SheetTitle className="font-bold text-lg mb-4">CitizenOS</SheetTitle>
            <nav className="flex flex-col gap-2">
              <NavTabs onClick={() => setMobileOpen(false)} />
            </nav>
            <div className="mt-4">
              <SearchBar />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
