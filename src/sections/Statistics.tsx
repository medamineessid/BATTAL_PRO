import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/hooks/useMockData';
import { useCountUp } from '@/hooks/useCountUp';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Eye,
  Briefcase,
  Award,
  Target,
  Clock,
  Zap,
  Star,
  CheckCircle,
  XCircle,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  ThumbsUp,
  MessageSquare,
  Share2,
  Bookmark,
  Activity,
  PieChart,
  LineChart,
  BarChart,
  MapPin,
} from 'lucide-react';

function toDate(v: any): Date {
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function Statistics() {
  const { user } = useAuth();
  const { profile, badges, applications, getJobMatches, swipedJobs } = useMockData();
  const [timeRange, setTimeRange] = useState('30d');

  const matches = getJobMatches();
  const highMatches = matches.filter(m => m.compatibilityScore >= 80);
  
  // Calculate statistics
  const totalApplications = applications.length;
  const pendingApplications = applications.filter(a => ['new', 'shortlisted', 'testing'].includes(a.status)).length;
  const interviewApplications = applications.filter(a => a.status === 'interview').length;
  const rejectedApplications = applications.filter(a => a.status === 'rejected').length;
  const hiredApplications = applications.filter(a => a.status === 'hired').length;
  
  const applicationSuccessRate = totalApplications > 0 
    ? Math.round(((interviewApplications + hiredApplications) / totalApplications) * 100) 
    : 0;

  const badgeStats = {
    total: badges.length,
    byLevel: {
      bronze: badges.filter(b => b.level === 'bronze').length,
      silver: badges.filter(b => b.level === 'silver').length,
      gold: badges.filter(b => b.level === 'gold').length,
      platinum: badges.filter(b => b.level === 'platinum').length,
    },
    byCategory: {
      technical: badges.filter(b => b.category === 'Technical Skills').length,
      soft: badges.filter(b => b.category === 'Soft Skills').length,
      language: badges.filter(b => b.category === 'Language Proficiency').length,
      aptitude: badges.filter(b => b.category === 'Aptitude').length,
    }
  };

  const countViews = useCountUp(127);
  const countApps = useCountUp(totalApplications);
  const countBadges = useCountUp(badgeStats.total);
  const countSuccess = useCountUp(applicationSuccessRate);

  // Derive weekly activity from real applications data
  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - (6 - i));
      const dayApps = applications.filter(a => {
        const d = toDate(a.appliedAt);
        return d.toDateString() === date.toDateString();
      }).length;
      return { day: days[date.getDay()], applications: dayApps, profileViews: Math.max(dayApps * 4, Math.floor(Math.random() * 10) + 5) };
    });
  })();

  // Derive monthly trend from real applications
  const monthlyTrend = (() => {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    return Array.from({ length: 6 }, (_, i) => {
      const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const count = applications.filter(a => {
        const ad = toDate(a.appliedAt);
        return ad.getMonth() === d.getMonth() && ad.getFullYear() === d.getFullYear();
      }).length;
      return { month: months[d.getMonth()], applications: count };
    });
  })();

  const maxMonthly = Math.max(...monthlyTrend.map(m => m.applications), 1);
  const maxWeekly = Math.max(...weeklyData.map(d => d.profileViews), 1);

  // Real skill stats
  const avgProficiency = profile.skills.length
    ? Math.round(profile.skills.reduce((a, s) => a + s.proficiency, 0) / profile.skills.length)
    : 0;

  const skillProgress = profile.skills.slice(0, 6).map(skill => ({
    name: skill.name,
    proficiency: skill.proficiency,
    category: skill.category,
  }));

  const getTrendIcon = (trend: 'up' | 'down' | 'neutral') => {
    if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-red-500" />;
    return null;
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Statistics</h2>
          <p className="text-muted-foreground">Track your job search progress and performance</p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange}>
          <TabsList>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">3 Months</TabsTrigger>
            <TabsTrigger value="1y">1 Year</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="card-hover animate-card stagger-1">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Profile Views</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{countViews}</p>
                  {getTrendIcon('up')}
                </div>
                <p className="text-xs text-green-500">+23% from last week</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-card stagger-2">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{countApps}</p>
                  {getTrendIcon('up')}
                </div>
                <p className="text-xs text-green-500">+5 this week</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Briefcase className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-card stagger-3">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Badges Earned</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{countBadges}</p>
                  {getTrendIcon('up')}
                </div>
                <p className="text-xs text-green-500">+2 this month</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <Award className="w-6 h-6 text-accent" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-hover animate-card stagger-4">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-bold">{countSuccess}%</p>
                  {getTrendIcon('neutral')}
                </div>
                <p className="text-xs text-muted-foreground">Interviews + Hires</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Target className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 lg:w-auto">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="matches">Job Matches</TabsTrigger>
        </TabsList>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-primary" />
                  Weekly Activity
                </CardTitle>
                <CardDescription>Profile views and applications over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {weeklyData.map((day, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <span className="w-8 text-sm text-muted-foreground">{day.day}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary/60 rounded-full transition-all duration-500"
                          style={{ width: `${(day.profileViews / maxWeekly) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-xs text-right text-muted-foreground">{day.profileViews}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/60" />
                    <span className="text-sm text-muted-foreground">Profile Views</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="w-5 h-5 text-primary" />
                  Activity Breakdown
                </CardTitle>
                <CardDescription>How recruiters are interacting with your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { label: 'Profile Views', value: 127, total: 200, color: 'bg-primary' },
                    { label: 'Job Applications', value: totalApplications, total: Math.max(totalApplications, 1), color: 'bg-blue-500' },
                    { label: 'Liked Jobs', value: swipedJobs.filter(s => s.liked).length, total: Math.max(swipedJobs.length, 1), color: 'bg-yellow-500' },
                    { label: 'Interview Requests', value: interviewApplications, total: Math.max(totalApplications, 1), color: 'bg-accent' },
                    { label: 'Hired', value: hiredApplications, total: Math.max(totalApplications, 1), color: 'bg-green-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{item.label}</span>
                        <span className="text-sm font-medium">{item.value}</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.value / item.total) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Response</p>
                  <p className="font-semibold">3.2 days</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <ThumbsUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Profile Score</p>
                  <p className="font-semibold">85/100</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Active Streak</p>
                  <p className="font-semibold">12 days</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Shares</p>
                  <p className="font-semibold">5</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Applications Tab */}
        <TabsContent value="applications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Application Funnel */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Application Funnel
                </CardTitle>
                <CardDescription>Your journey through the hiring process</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    { stage: 'Applications Submitted', count: totalApplications, color: 'bg-primary', icon: Briefcase },
                    { stage: 'Under Review', count: pendingApplications, color: 'bg-yellow-500', icon: Clock },
                    { stage: 'Interviews', count: interviewApplications, color: 'bg-accent', icon: Users },
                    { stage: 'Offers', count: applications.filter(a => a.status === 'offer').length, color: 'bg-pink-500', icon: Bookmark },
                    { stage: 'Hired', count: hiredApplications, color: 'bg-green-500', icon: CheckCircle },
                  ].map((item, index, arr) => {
                    const percentage = index === 0 ? 100 : Math.round((item.count / totalApplications) * 100) || 0;
                    const Icon = item.icon;
                    return (
                      <div key={index} className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-lg ${item.color} bg-opacity-20 flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${item.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{item.stage}</span>
                            <span className="text-sm">{item.count} ({percentage}%)</span>
                          </div>
                          <div className="h-3 bg-muted rounded-full overflow-hidden">
                            <div className={`h-full ${item.color} rounded-full`} style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Application Status */}
            <Card>
              <CardHeader>
                <CardTitle>Status Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm">Pending</span>
                    </div>
                    <Badge variant="secondary">{pendingApplications}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      <span className="text-sm">Interview</span>
                    </div>
                    <Badge variant="secondary">{interviewApplications}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">Hired</span>
                    </div>
                    <Badge variant="secondary">{hiredApplications}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                    <div className="flex items-center gap-2">
                      <XCircle className="w-4 h-4 text-red-500" />
                      <span className="text-sm">Rejected</span>
                    </div>
                    <Badge variant="secondary">{rejectedApplications}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LineChart className="w-5 h-5 text-primary" />
                Application Trends
              </CardTitle>
              <CardDescription>Applications submitted over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-48">
                {monthlyTrend.map((data, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs text-muted-foreground">{data.applications}</span>
                    <div
                      className="w-full bg-primary/60 rounded-t-lg transition-all hover:bg-primary"
                      style={{ height: `${Math.max((data.applications / maxMonthly) * 100, 4)}%` }}
                    />
                    <span className="text-xs text-muted-foreground">{data.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skill Proficiency */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart className="w-5 h-5 text-primary" />
                  Skill Proficiency
                </CardTitle>
                <CardDescription>Your top skills by proficiency level</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {skillProgress.map((skill, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium">{skill.name}</span>
                        <span className="text-sm text-muted-foreground">{skill.proficiency}%</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            skill.proficiency >= 90 ? 'bg-green-500' :
                            skill.proficiency >= 75 ? 'bg-blue-500' :
                            skill.proficiency >= 60 ? 'bg-yellow-500' : 'bg-muted-foreground'
                          }`}
                          style={{ width: `${skill.proficiency}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Skills by Category */}
            <Card>
              <CardHeader>
                <CardTitle>Skills by Category</CardTitle>
                <CardDescription>Distribution of your skills</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Technical Skills', count: profile.skills.filter(s => s.category === 'technical').length, color: 'bg-blue-500' },
                    { category: 'Soft Skills', count: profile.skills.filter(s => s.category === 'soft').length, color: 'bg-green-500' },
                    { category: 'Languages', count: profile.skills.filter(s => s.category === 'language').length, color: 'bg-purple-500' },
                    { category: 'Industry Knowledge', count: profile.skills.filter(s => s.category === 'industry').length, color: 'bg-orange-500' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <Badge variant="secondary">{item.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Skill Growth */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Skill Growth
              </CardTitle>
              <CardDescription>New skills added over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="text-center p-4 rounded-xl bg-muted flex-1">
                  <p className="text-3xl font-bold text-primary">{profile.skills.length}</p>
                  <p className="text-sm text-muted-foreground">Total Skills</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted flex-1">
                  <p className="text-3xl font-bold text-green-500">{profile.skills.filter(s => s.category === 'technical').length}</p>
                  <p className="text-sm text-muted-foreground">Technical</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted flex-1">
                  <p className="text-3xl font-bold text-accent">{avgProficiency}%</p>
                  <p className="text-sm text-muted-foreground">Avg Proficiency</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full badge-platinum mx-auto flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{badgeStats.byLevel.platinum}</p>
                <p className="text-sm text-muted-foreground">Platinum</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full badge-gold mx-auto flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{badgeStats.byLevel.gold}</p>
                <p className="text-sm text-muted-foreground">Gold</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full badge-silver mx-auto flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{badgeStats.byLevel.silver}</p>
                <p className="text-sm text-muted-foreground">Silver</p>
              </CardContent>
            </Card>
            <Card className="card-hover">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 rounded-full badge-bronze mx-auto flex items-center justify-center mb-3">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <p className="text-3xl font-bold">{badgeStats.byLevel.bronze}</p>
                <p className="text-sm text-muted-foreground">Bronze</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Badges by Category</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { category: 'Technical Skills', count: badgeStats.byCategory.technical, icon: '💻' },
                    { category: 'Soft Skills', count: badgeStats.byCategory.soft, icon: '🤝' },
                    { category: 'Language Proficiency', count: badgeStats.byCategory.language, icon: '🌐' },
                    { category: 'Aptitude', count: badgeStats.byCategory.aptitude, icon: '🧠' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="text-sm">{item.category}</span>
                      </div>
                      <Badge variant="secondary">{item.count} badges</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {badges.slice(0, 4).map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                      <div className={`w-10 h-10 rounded-lg ${
                        badge.level === 'platinum' ? 'badge-platinum' :
                        badge.level === 'gold' ? 'badge-gold' :
                        badge.level === 'silver' ? 'badge-silver' : 'badge-bronze'
                      } flex items-center justify-center`}>
                        <Award className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{badge.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{badge.level} • {badge.score}%</p>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {toDate(badge.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Job Matches Tab */}
        <TabsContent value="matches" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Match Quality Distribution
                </CardTitle>
                <CardDescription>How well jobs match your profile</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { range: 'Excellent (90-100%)', count: matches.filter(m => m.compatibilityScore >= 90).length, color: 'bg-green-500' },
                    { range: 'Great (80-89%)', count: matches.filter(m => m.compatibilityScore >= 80 && m.compatibilityScore < 90).length, color: 'bg-blue-500' },
                    { range: 'Good (70-79%)', count: matches.filter(m => m.compatibilityScore >= 70 && m.compatibilityScore < 80).length, color: 'bg-yellow-500' },
                    { range: 'Fair (60-69%)', count: matches.filter(m => m.compatibilityScore >= 60 && m.compatibilityScore < 70).length, color: 'bg-orange-500' },
                    { range: 'Low (<60%)', count: matches.filter(m => m.compatibilityScore < 60).length, color: 'bg-red-500' },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex justify-between mb-1">
                        <span className="text-sm">{item.range}</span>
                        <span className="text-sm font-medium">{item.count} jobs</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${(item.count / matches.length) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Match Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 rounded-xl bg-muted">
                    <p className="text-4xl font-bold text-primary">{matches.length}</p>
                    <p className="text-sm text-muted-foreground">Total Job Matches</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted">
                    <p className="text-4xl font-bold text-green-500">{highMatches.length}</p>
                    <p className="text-sm text-muted-foreground">High Matches (80%+)</p>
                  </div>
                  <div className="text-center p-4 rounded-xl bg-muted">
                    <p className="text-4xl font-bold text-accent">
                      {matches.length > 0 ? Math.round(matches.reduce((acc, m) => acc + m.compatibilityScore, 0) / matches.length) : 0}%
                    </p>
                    <p className="text-sm text-muted-foreground">Average Match Score</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Matching Factors */}
          <Card>
            <CardHeader>
              <CardTitle>Your Strongest Matching Factors</CardTitle>
              <CardDescription>What makes you a good match for jobs</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {[
                  { factor: 'Skills Match', score: Math.round(matches.reduce((acc, m) => acc + m.skillsMatch, 0) / matches.length) || 0, icon: Target },
                  { factor: 'Experience', score: Math.round(matches.reduce((acc, m) => acc + m.experienceMatch, 0) / matches.length) || 0, icon: Briefcase },
                  { factor: 'Location', score: Math.round(matches.reduce((acc, m) => acc + m.locationMatch, 0) / matches.length) || 0, icon: MapPin },
                  { factor: 'Salary', score: Math.round(matches.reduce((acc, m) => acc + m.salaryMatch, 0) / matches.length) || 0, icon: '💰' },
                  { factor: 'Industry', score: Math.round(matches.reduce((acc, m) => acc + m.industryMatch, 0) / matches.length) || 0, icon: '💼' },
                ].map((item, i) => (
                  <div key={i} className="text-center p-4 rounded-xl bg-muted">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-2">
                      {typeof item.icon === 'string' ? (
                        <span className="text-2xl">{item.icon}</span>
                      ) : (
                        <item.icon className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <p className="text-2xl font-bold">{item.score}%</p>
                    <p className="text-xs text-muted-foreground">{item.factor}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
