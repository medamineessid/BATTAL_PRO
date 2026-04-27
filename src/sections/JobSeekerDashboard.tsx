import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/hooks/useMockData';
import { useCountUp } from '@/hooks/useCountUp';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Briefcase, FileText, Award, Bell, Settings as SettingsIcon, TrendingUp,
  MapPin, DollarSign, Clock, Building2, Star, CheckCircle, Code, MessageCircle,
  Languages, Brain, ChevronRight, Filter, Search, Download, Eye, Play, Trophy,
  BarChart3, Heart, Sun, Moon, Loader2, Send,
} from 'lucide-react';
import { LikedJobs } from './LikedJobs';
import { CVGenerator } from './CVGenerator';
import { JobMatcher } from './JobMatcher';
import { QuizSystem } from './QuizSystem';
import { Settings } from './Settings';
import { Statistics } from './Statistics';

const toDate = (v: any): Date => (v instanceof Date ? v : new Date(v));

function ApplyButton({ jobId, jobTitle, companyName }: { jobId: string; jobTitle: string; companyName: string }) {
  const { applyToJob, applications } = useMockData();
  const [state, setState] = useState<'idle' | 'loading' | 'done'>(
    () => applications.some(a => a.jobId === jobId) ? 'done' : 'idle'
  );

  const handleClick = () => {
    if (state !== 'idle') return;
    setState('loading');
    applyToJob(jobId);
    setTimeout(() => setState('done'), 600);
  };

  if (state === 'done') {
    return (
      <button
        disabled
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 animate-badge-pop"
      >
        <CheckCircle className="w-3.5 h-3.5" />
        Applied
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state === 'loading'}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 active:scale-95 ${
        state === 'loading'
          ? 'bg-primary/50 text-primary-foreground cursor-not-allowed'
          : 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm hover:shadow-md'
      }`}
    >
      {state === 'loading'
        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
        : <Send className="w-3.5 h-3.5" />}
      {state === 'loading' ? 'Applying...' : 'Apply'}
    </button>
  );
}

export function JobSeekerDashboard({ toggleTheme, theme }: { toggleTheme?: () => void; theme?: 'light' | 'dark' }) {
  const { user } = useAuth();
  const { profile, badges, notifications, applications, getJobMatches, companies: mockCompanies } = useMockData();
  const [activeSection, setActiveSectionState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('section') || 'overview';
  });

  const setActiveSection = (section: string) => {
    setActiveSectionState(section);
    const url = new URL(window.location.href);
    url.searchParams.set('section', section);
    window.history.pushState({}, '', url.toString());
  };

  useEffect(() => {
    const onPop = () => {
      const params = new URLSearchParams(window.location.search);
      setActiveSectionState(params.get('section') || 'overview');
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);
  const matches = getJobMatches();
  const unreadNotifications = notifications.filter(n => !n.read);
  const countApps = useCountUp(applications.length);
  const countBadges = useCountUp(badges.length);
  const countViews = useCountUp(127);
  const countMatch = useCountUp(87);

  const getBadgeIcon = (icon: string) => {
    switch (icon) {
      case 'code': return <Code className="w-4 h-4" />;
      case 'atom': return <Star className="w-4 h-4" />;
      case 'message-circle': return <MessageCircle className="w-4 h-4" />;
      case 'languages': return <Languages className="w-4 h-4" />;
      case 'brain': return <Brain className="w-4 h-4" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'bronze': return 'badge-bronze';
      case 'silver': return 'badge-silver';
      case 'gold': return 'badge-gold';
      case 'platinum': return 'badge-platinum';
      default: return 'bg-muted';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6 animate-slide-up">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-background border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, <span className="gradient-text">{user?.firstName}</span>! 👋
          </h1>
          <p className="text-muted-foreground max-w-lg">
            You have {applications.length} active applications and {matches.filter(m => m.compatibilityScore > 80).length} high-match jobs waiting for you.
          </p>
          <div className="flex gap-3 mt-6">
            <Button onClick={() => setActiveSection('jobs')}>
              <Search className="w-4 h-4 mr-2" />
              Find Jobs
            </Button>
            <Button variant="outline" onClick={() => setActiveSection('cv')}>
              <FileText className="w-4 h-4 mr-2" />
              Update CV
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Applications', value: countApps, icon: Briefcase, color: 'bg-primary/10 text-primary' },
          { label: 'Badges Earned', value: countBadges, icon: Trophy, color: 'bg-accent/10 text-accent' },
          { label: 'Profile Views', value: countViews, icon: Eye, color: 'bg-green-500/10 text-green-500' },
          { label: 'Match Score', value: countMatch, icon: TrendingUp, color: 'bg-pink-500/10 text-pink-500', suffix: '%' },
        ].map((stat, i) => (
          <Card key={stat.label} className={`card-hover animate-card stagger-${i + 1}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}{stat.suffix ?? ''}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Completion */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Profile Completion</CardTitle>
            <CardDescription>Complete your profile to increase visibility to employers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-bold text-primary">85%</span>
              </div>
              <Progress value={85} className="h-2" />
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                {[
                  { label: 'Personal Info', complete: true },
                  { label: 'Work Experience', complete: true },
                  { label: 'Education', complete: true },
                  { label: 'Skills', complete: true },
                  { label: 'Certifications', complete: true },
                  { label: 'Portfolio', complete: false },
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      item.complete ? 'bg-green-500/20 text-green-500' : 'bg-muted text-muted-foreground'
                    }`}>
                      {item.complete ? <CheckCircle className="w-3 h-3" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                    </div>
                    <span className={`text-sm ${item.complete ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Badges */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Badges</CardTitle>
            <CardDescription>Your latest achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {badges.slice(0, 3).map((badge) => (
                <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className={`w-10 h-10 rounded-lg ${getBadgeClass(badge.level)} flex items-center justify-center text-white`}>
                    {getBadgeIcon(badge.icon)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{badge.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{badge.level} • {badge.score}%</p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="ghost" className="w-full mt-4" onClick={() => setActiveSection('badges')}>
              View All Badges
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Top Job Matches */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Top Job Matches</CardTitle>
            <CardDescription>Jobs that best match your skills and preferences</CardDescription>
          </div>
          <Button variant="outline" onClick={() => setActiveSection('jobs')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {matches.slice(0, 3).map((match, i) => (
              <div key={match.job.id} className={`animate-card stagger-${i + 1} flex items-start gap-4 p-4 rounded-xl border border-border/50 hover:border-primary/30 transition-colors`}>
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold truncate">{match.job.title}</h4>
                    <Badge variant={match.compatibilityScore >= 80 ? 'default' : 'secondary'}>
                      {match.compatibilityScore}% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {mockCompanies.find(c => c.id === match.job.companyId)?.name} • {match.job.location.city || 'Remote'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {match.job.skills.slice(0, 3).map((skill, i) => (
                      <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <ApplyButton
                  jobId={match.job.id}
                  jobTitle={match.job.title}
                  companyName={mockCompanies.find(c => c.id === match.job.companyId)?.name ?? ''}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border z-40 hidden lg:block">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Battal Pro</span>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'jobs', label: 'Discover Jobs', icon: Search },
              { id: 'liked', label: 'Liked Jobs', icon: Heart },
              { id: 'statistics', label: 'Statistics', icon: BarChart3 },
              { id: 'cv', label: 'CV Generator', icon: FileText },
              { id: 'badges', label: 'Quizzes & Badges', icon: Award },
              { id: 'applications', label: 'Applications', icon: Briefcase },
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifications.length },
              { id: 'settings', label: 'Settings', icon: SettingsIcon },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeSection === item.id
                    ? 'bg-primary/10 text-primary scale-[1.02]'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="flex-1 text-left">{item.label}</span>
                {item.badge ? (
                  <span className="px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-2">
            <Avatar>
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.firstName} {user?.lastName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          {toggleTheme && (
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-2 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card border-b border-border z-40 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold">Battal Pro</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen">
        <div className="p-6 lg:p-8 pt-20 lg:pt-8">
          <div key={activeSection} className="animate-section">
          {activeSection === 'overview' && renderOverview()}
          {activeSection === 'jobs' && <JobMatcher />}
          {activeSection === 'liked' && <LikedJobs />}
          {activeSection === 'statistics' && <Statistics />}
          {activeSection === 'cv' && <CVGenerator onNavigateToSettings={() => setActiveSection('settings')} />}
          {activeSection === 'badges' && <QuizSystem />}
          {activeSection === 'applications' && (
            <div>
              <h2 className="text-2xl font-bold mb-6">My Applications</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {applications.map((app) => {
                      const job = matches.find(m => m.job.id === app.jobId)?.job;
                      return (
                        <div key={app.id} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                              <Briefcase className="w-5 h-5 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="font-medium">{job?.title}</p>
                              <p className="text-sm text-muted-foreground">
                                Applied {toDate(app.appliedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Badge className="capitalize">{app.status}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {activeSection === 'notifications' && (
            <div className="animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Notifications</h2>
              <Card>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`p-4 rounded-lg border ${notif.read ? 'border-border/50' : 'border-primary/30 bg-primary/5'}`}>
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${notif.read ? 'bg-muted' : 'bg-primary'}`} />
                          <div>
                            <p className="font-medium">{notif.title}</p>
                            <p className="text-sm text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {toDate(notif.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {activeSection === 'settings' && <Settings />}
          </div>
        </div>
      </main>
    </div>
  );
}
