import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Heart, Building2, Star, CheckCircle, MapPin, Briefcase, DollarSign, TrendingUp, Send, Info, Code, X } from 'lucide-react';
import { Job } from '@/types';

const toDate = (v: any): Date => (v instanceof Date ? v : new Date(v));

export function LikedJobs() {
  const { swipedJobs, getJobMatches, companies, applyToJob, applications } = useMockData();
  const [showDetail, setShowDetail] = useState<Job | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const matches = getJobMatches();

  // Get liked jobs directly - filtering out those we've already applied for
  const likedJobs = matches.filter(m => 
    swipedJobs.find(s => s.liked && s.jobId === m.job.id) &&
    !applications.some(app => app.jobId === m.job.id)
  );

  const getCompany = (job: Job) => {
    return companies.find(c => c.id === job.companyId) || { name: 'Unknown Company', logo: undefined };
  };

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20 border-green-500/30';
    if (score >= 75) return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
    if (score >= 60) return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
    return 'text-muted-foreground bg-muted';
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
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

  return (
    <div className="animate-slide-up space-y-6">
      {/* Toast Notification */}
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

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Liked Jobs</h2>
          <p className="text-muted-foreground">
            {likedJobs.length} jobs you've swiped right on
          </p>
        </div>
      </div>

      {likedJobs.length > 0 ? (
        showDetail ? (
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

              <div className="p-4 border-t border-border">
                {!applications.some(app => app.jobId === showDetail.id) ? (
                  <Button className="w-full" onClick={() => handleApply(showDetail.id)}>
                    <Send className="w-4 h-4 mr-2" />Apply Now
                  </Button>
                ) : (
                  <Button className="w-full" variant="secondary" disabled>
                    <CheckCircle className="w-4 h-4 mr-2" />Applied
                  </Button>
                )}
              </div>
            </Card>
          </div>
        ) : (
        <div className="space-y-4">
          {likedJobs.map((match, i) => {
            const job = match.job;
            const company = getCompany(job);
            const hasApplied = applications.some(app => app.jobId === job.id);
            const swipedInfo = swipedJobs.find(s => s.jobId === job.id);
            return (
              <Card key={job.id} className={`card-hover animate-card`} style={{ animationDelay: `${i * 0.07}s` }}>
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                      {company?.logo ? (
                        <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                      ) : (
                        <Building2 className="w-7 h-7 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold truncate">{job.title}</h4>
                        <Badge className={`${getMatchColor(match.compatibilityScore)} border`}>
                          <Star className="w-3 h-3 mr-1 fill-current" />
                          {match.compatibilityScore}% Match
                        </Badge>
                        {hasApplied && (
                          <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Applied
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground mb-2">
                        {company?.name} • {job.location.remote ? 'Remote' : job.location.city}
                      </p>

                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.skills.slice(0, 4).map((skill, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-muted">
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Liked {swipedInfo?.timestamp ? toDate(swipedInfo.timestamp).toLocaleDateString() : ''}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {!hasApplied ? (
                        <Button size="sm" onClick={() => handleApply(job.id)}>
                          <Send className="w-4 h-4 mr-2" />
                          Apply
                        </Button>
                      ) : (
                        <Button size="sm" variant="secondary" disabled>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Applied
                        </Button>
                      )}
                      <Button variant="outline" size="sm" onClick={() => setShowDetail(job)}>
                        <Info className="w-4 h-4 mr-2" />
                        Details
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
        )
      ) : (
        <div className="text-center py-20">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Heart className="w-12 h-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No matches yet</h3>
          <p className="text-muted-foreground mb-6">
            Start swiping in Discover to add jobs here.
          </p>
        </div>
      )}

    </div>
  );
}
