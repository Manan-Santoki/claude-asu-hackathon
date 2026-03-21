import { Link } from 'react-router-dom'
import { FileText, Users, ClipboardList } from 'lucide-react'
import { useAuthStore } from '@/stores/useAuthStore'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import PageWrapper from '@/components/layout/PageWrapper'

const quickLinks = [
  {
    to: '/bill/latest',
    icon: FileText,
    title: 'Saved Bills',
    description: 'Review bills you bookmarked',
  },
  {
    to: '/reps',
    icon: Users,
    title: 'Followed Reps',
    description: 'Track your representatives',
  },
  {
    to: '/vote',
    icon: ClipboardList,
    title: 'Policy Quiz',
    description: 'Find your political match',
  },
]

export default function Dashboard() {
  const { user } = useAuthStore()

  return (
    <PageWrapper>
      <h1 className="text-2xl font-bold tracking-tight mb-1">
        Welcome back{user?.name ? `, ${user.name}` : ''}
      </h1>
      <p className="text-muted-foreground mb-6">
        Here is a quick overview of your CitizenOS activity.
      </p>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {quickLinks.map((link) => (
          <Card key={link.to} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <link.icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">{link.title}</CardTitle>
              </div>
              <CardDescription>{link.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" size="sm">
                <Link to={link.to}>Go &rarr;</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageWrapper>
  )
}
