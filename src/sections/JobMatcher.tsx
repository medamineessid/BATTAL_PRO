import { useState, useEffect, useMemo, useRef } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  X,
  Heart,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  TrendingUp,
  Code,
  CheckCircle,
  Star,
  RotateCcw,
  Info,
  Send,
  Bookmark,
  SlidersHorizontal,
} from 'lucide-react';
import { Job, JobMatch } from '@/types';

interface SwipedJob {
  jobId: string;
  liked: boolean;
  timestamp: Date;
}

export function JobMatcher() {
  const { profile, swipedJobs, companies, getJobMatches, swipeJob, undoSwipe, applyToJob, applications } = useMockData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [localSwipedJobs, setLocalSwipedJobs] = useState<SwipedJob[]>([]);
  const [showDetail, setShowDetail] = useState<Job | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const allSwipedJobs = useMemo(() => {
    return [...swipedJobs, ...localSwipedJobs];
  }, [swipedJobs, localSwipedJobs]);

  const matches = getJobMatches();

  const availableJobs = useMemo(() => {
    const swipedIds = new Set(swipedJobs.map(s => s.jobId));
    const appliedIds = new Set(applications.map(a => a.jobId));
    return matches.filter(m => !swipedIds.has(m.job.id) && !appliedIds.has(m.job.id));
  }, [matches, swipedJobs, applications]);

  const currentJob = availableJobs[currentIndex];

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSwipe = async (liked: boolean) => {
    if (!currentJob || isAnimating) return;
    setIsAnimating(true);
    setDirection(liked ? 'right' : 'left');
    swipeJob(currentJob.job.id, liked);
    setTimeout(() => {
      setLocalSwipedJobs(prev => [...prev, { jobId: currentJob.job.id, liked, timestamp: new Date() }]);
      setCurrentIndex(prev => prev + 1);
      setDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleUndo = () => {
    if (localSwipedJobs.length === 0) return;
    undoSwipe();
    setLocalSwipedJobs(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };

  const handleApply = async (jobId: string) => {
    if (applications.some(app => app.jobId === jobId)) {
      showToast('You have already applied to this job.', 'error');
      return;
    }
    const jobMatch = matches.find(m => m.job.id === jobId);
    const job = jobMatch?.job;
    const company = job ? getCompany(job) : null;
    const msg = job
      ? `Applied to ${job.title} at ${company?.name || 'the company'}! ✓`
      : 'Application submitted successfully!';
    showToast(msg, 'success');
    setShowDetail(null);
    applyToJob(jobId).catch(() => showToast('Failed to submit application.', 'error'));
  };

  const getCompany = (job: Job) => {
    return companies.find(c => c.id === job.companyId) || { name: 'Unknown Company', logo: undefined };
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-muted-foreground bg-muted';
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handleSwipe(false);
      if (e.key === 'ArrowRight') handleSwipe(true);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentJob, isAnimating]);

  const renderJobCard = (jobMatch: JobMatch, isPreview: boolean = false) => {
    const job = jobMatch.job;
    const company = getCompany(job);

    return (
      <div className="relative w-full max-w-md mx-auto" style={{ touchAction: 'none' }}>
        <Card
          className={`flex flex-col overflow-hidden border-2 transition-all duration-300 ${
            direction === 'right' && !isPreview
              ? 'translate-x-full rotate-12 opacity-0'
              : direction === 'left' && !isPreview
                ? '-translate-x-full -rotate-12 opacity-0'
                : ''
          } ${!isPreview ? 'shadow-2xl' : ''}`}
        >
          {/* Company Header */}
          <div className="h-32 bg-gradient-to-br from-primary/30 via-accent/20 to-background relative shrink-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-2xl bg-card border-2 border-white/10 flex items-center justify-center shadow-xl">
                {company?.logo ? (
                  <img src={company.logo} alt={company.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <Building2 className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="absolute top-4 right-4">
              <Badge className={`${getMatchColor(jobMatch.compatibilityScore)} border`}>
                <Star className="w-3 h-3 mr-1 fill-current" />
                {jobMatch.compatibilityScore}% Match
              </Badge>
            </div>
          </div>

          {/* Job Content */}
          <CardContent className="flex-1 p-6 pt-12">
            <div className="text-center mb-4">
              <h3 className="text-xl font-bold mb-1">{job.title}</h3>
              <p className="text-muted-foreground">{company?.name}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 mb-4">
              <Badge variant="secondary" className="text-xs">
                <MapPin className="w-3 h-3 mr-1" />
                {job.location.remote ? 'Remote' : job.location.city}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <Briefcase className="w-3 h-3 mr-1" />
                {job.type.replace('-', ' ')}
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <TrendingUp className="w-3 h-3 mr-1" />
                {job.experienceLevel}
              </Badge>
              {job.salary && (
                <Badge variant="secondary" className="text-xs">
                  <DollarSign className="w-3 h-3 mr-1" />
                  ${(job.salary.min / 1000).toFixed(0)}k
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              {[
                { label: 'Skills', value: jobMatch.skillsMatch },
                { label: 'Exp', value: jobMatch.experienceMatch },
                { label: 'Loc', value: jobMatch.locationMatch },
                { label: 'Pay', value: jobMatch.salaryMatch },
                { label: 'Ind', value: jobMatch.industryMatch },
              ].map(({ label, value }) => (
                <div key={label} className="text-center p-2 rounded-lg bg-muted">
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className={`text-sm font-semibold ${value >= 80 ? 'text-green-400' : ''}`}>{value}%</p>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-1 mb-4">
              {job.skills.slice(0, 5).map((skill, i) => {
                const hasSkill = profile?.skills?.some(s => s.name.toLowerCase() === skill.toLowerCase()) || false;
                return (
                  <Badge
                    key={i}
                    variant={hasSkill ? 'default' : 'secondary'}
                    className={`text-xs ${hasSkill ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30' : ''}`}
                  >
                    {hasSkill && <CheckCircle className="w-2 h-2 mr-1" />}
                    {skill}
                  </Badge>
                );
              })}
              {job.skills.length > 5 && (
                <Badge variant="outline" className="text-xs">+{job.skills.length - 5}</Badge>
              )}
            </div>

            <p className="text-sm text-muted-foreground text-center line-clamp-3">
              {job.description}
            </p>
          </CardContent>

          {/* Action Buttons */}
          {!isPreview && (
            <div className="p-4 border-t border-border bg-card shrink-0">
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => handleSwipe(false)}
                  className="w-14 h-14 rounded-full bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <X className="w-7 h-7" />
                </button>
                <button
                  onClick={() => setShowDetail(job)}
                  className="w-12 h-12 rounded-full bg-muted text-muted-foreground hover:bg-primary/20 hover:text-primary transition-all duration-200 flex items-center justify-center"
                >
                  <Info className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSwipe(true)}
                  className="w-14 h-14 rounded-full bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all duration-200 flex items-center justify-center shadow-lg"
                >
                  <Heart className="w-7 h-7" />
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-3">
                Press &larr; to skip, &rarr; to like
              </p>
            </div>
          )}
        </Card>

        {!isPreview && availableJobs[currentIndex + 1] && (
          <div className="absolute inset-x-2 -bottom-2 h-3 -z-10 rounded-b-xl border-2 border-border/50 bg-card opacity-60" />
        )}
      </div>
    );
  };

  return (
    <div className="animate-slide-up space-y-6">
      {toast && (
        <div
          className={`fixed top-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border animate-slide-up max-w-sm ${
            toast.type === 'success'
              ? 'bg-green-900/90 border-green-500/40 text-green-100'
              : 'bg-red-900/90 border-red-500/40 text-red-100'
          }`}
        >
          {toast.type === 'success'
            ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            : <X className="w-5 h-5 text-red-400 flex-shrink-0" />}
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Discover Jobs</h2>
            <p className="text-muted-foreground">{availableJobs.length} jobs waiting for you</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
              <SlidersHorizontal className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        <div className="mt-0">
          {currentJob ? (
            <div className="relative">
              {!showDetail && localSwipedJobs.length > 0 && (
                <button
                  onClick={handleUndo}
                  className="absolute top-4 left-4 z-20 w-10 h-10 rounded-full bg-muted hover:bg-primary/20 transition-colors flex items-center justify-center"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
              )}
              <div className="py-8">
                {showDetail ? (
                  <div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-200">
                    <Card className="border-2 shadow-2xl overflow-hidden">
                      <div className="flex items-start gap-4 p-6 border-b border-border">
                        <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                          <Building2 className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h2 className="text-2xl font-bold">{showDetail.title}</h2>
                          <p className="text-muted-foreground text-lg">{getCompany(showDetail).name} &mdash; {showDetail.location.city || 'Remote'}</p>
                        </div>
                        <button onClick={() => setShowDetail(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="secondary"><Briefcase className="w-4 h-4 mr-2" />{showDetail.type.replace('-', ' ')}</Badge>
                          <Badge variant="secondary"><TrendingUp className="w-4 h-4 mr-2" />{showDetail.experienceLevel}</Badge>
                          {showDetail.location.remote && <Badge variant="secondary"><MapPin className="w-4 h-4 mr-2" />Remote</Badge>}
                          {showDetail.salary && (
                            <Badge variant="secondary"><DollarSign className="w-4 h-4 mr-2" />${(showDetail.salary.min / 1000).toFixed(0)}k - ${(showDetail.salary.max / 1000).toFixed(0)}k</Badge>
                          )}
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">About the Role</h4>
                          <p className="text-muted-foreground">{showDetail.description}</p>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Requirements</h4>
                          <ul className="space-y-2">
                            {showDetail.requirements.map((req, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />{req}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Responsibilities</h4>
                          <ul className="space-y-2">
                            {showDetail.responsibilities.map((resp, i) => (
                              <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />{resp}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <h4 className="font-semibold mb-2">Required Skills</h4>
                          <div className="flex flex-wrap gap-2">
                            {showDetail.skills.map((skill, i) => (
                              <Badge key={i} variant="secondary"><Code className="w-3 h-3 mr-1" />{skill}</Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border-t border-border flex gap-3">
                        {!applications.some(app => app.jobId === showDetail.id) ? (
                          <Button className="flex-1" onClick={() => handleApply(showDetail.id)}>
                            <Send className="w-4 h-4 mr-2" />Apply Now
                          </Button>
                        ) : (
                          <Button className="flex-1" variant="secondary" disabled>
                            <CheckCircle className="w-4 h-4 mr-2" />Applied
                          </Button>
                        )}

                      </div>
                    </Card>
                  </div>
                ) : (
                  renderJobCard(currentJob)
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <Bookmark className="w-12 h-12 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No more jobs</h3>
              <p className="text-muted-foreground mb-6">You've seen all available jobs. Check your filters.</p>
              <div className="flex justify-center gap-3">
                <Button onClick={() => { setLocalSwipedJobs([]); setCurrentIndex(0); localStorage.removeItem('mock_swiped_jobs'); }}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>


    </div>
  );
}
