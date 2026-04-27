import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Briefcase, Building2, MapPin, DollarSign, ArrowRight,
  CheckCircle, Code, GraduationCap, Plus, X, Globe, Linkedin,
} from 'lucide-react';

interface Props { onComplete: () => void; }

const STEP_LABELS_SEEKER = ['Profile', 'Location', 'Salary', 'Skills', 'Experience', 'Education'];
const STEP_LABELS_COMPANY = ['Company', 'Location', 'Links', 'First Job'];

export function OnboardingModal({ onComplete }: Props) {
  const { user } = useAuth();
  const isCompany = user?.role === 'company_admin';
  const totalSteps = isCompany ? 4 : 6;
  const [step, setStep] = useState(1);

  // ── JOB SEEKER ──
  const [headline, setHeadline] = useState('');
  const [summary, setSummary] = useState('');
  const [jobTypes, setJobTypes] = useState<string[]>([]);
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [remote, setRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState<string[]>([]);
  const [experiences, setExperiences] = useState<{ position: string; company: string; startDate: string; endDate: string; current: boolean; description: string }[]>([]);
  const [expForm, setExpForm] = useState({ position: '', company: '', startDate: '', endDate: '', current: false, description: '' });
  const [educations, setEducations] = useState<{ degree: string; institution: string; fieldOfStudy: string; startDate: string; endDate: string; current: boolean }[]>([]);
  const [eduForm, setEduForm] = useState({ degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', current: false });

  // ── COMPANY ──
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [companySize, setCompanySize] = useState('');
  const [headquarters, setHeadquarters] = useState('');
  const [companyCountry, setCompanyCountry] = useState('');
  const [description, setDescription] = useState('');
  const [website, setWebsite] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('');
  const [jobLocation, setJobLocation] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  const toggleJobType = (type: string) =>
    setJobTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !skills.includes(s)) setSkills(prev => [...prev, s]);
    setSkillInput('');
  };

  const addExperience = () => {
    if (!expForm.position || !expForm.company) return;
    setExperiences(prev => [...prev, expForm]);
    setExpForm({ position: '', company: '', startDate: '', endDate: '', current: false, description: '' });
  };

  const addEducation = () => {
    if (!eduForm.degree || !eduForm.institution) return;
    setEducations(prev => [...prev, eduForm]);
    setEduForm({ degree: '', institution: '', fieldOfStudy: '', startDate: '', endDate: '', current: false });
  };

  const canProceed = () => {
    if (isCompany) {
      if (step === 1) return !!companyName && !!industry;
      if (step === 2) return !!headquarters;
      return true;
    }
    if (step === 1) return !!headline;
    if (step === 2) return !!city && !!country;
    return true;
  };

  const handleFinish = () => {
    if (isCompany) {
      localStorage.setItem('onboarding_company', JSON.stringify({
        companyName, industry, companySize, headquarters, companyCountry,
        description, website, linkedin, jobTitle, jobType, jobLocation, jobDesc,
      }));
    } else {
      localStorage.setItem('onboarding_profile', JSON.stringify({
        headline, summary, city, country, remote, jobTypes,
        salaryMin, salaryMax, currency, skills, experiences, educations,
      }));
    }
    onComplete();
  };

  const stepLabels = isCompany ? STEP_LABELS_COMPANY : STEP_LABELS_SEEKER;
  const progress = Math.round((step / totalSteps) * 100);

  return (
    <Dialog open>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto" onInteractOutside={e => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
              {isCompany ? <Building2 className="w-5 h-5 text-white" /> : <Briefcase className="w-5 h-5 text-white" />}
            </div>
            <div>
              <DialogTitle>Welcome, {user?.firstName}! 👋</DialogTitle>
              <DialogDescription>{stepLabels[step - 1]} — Step {step} of {totalSteps}</DialogDescription>
            </div>
          </div>
          <Progress value={progress} className="h-1.5 mt-2" />
          {/* Step dots */}
          <div className="flex gap-1.5 mt-3 justify-center">
            {stepLabels.map((label, i) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`w-2 h-2 rounded-full transition-all ${i + 1 < step ? 'bg-primary' : i + 1 === step ? 'bg-primary scale-125' : 'bg-muted-foreground/30'}`} />
              </div>
            ))}
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-4 min-h-[240px]">

          {/* ════ JOB SEEKER STEPS ════ */}

          {/* Step 1 — Headline & Job Type */}
          {!isCompany && step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">Let's start with the basics</p>
              <div className="space-y-2">
                <Label>Professional Headline <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Senior Full Stack Developer" value={headline} onChange={e => setHeadline(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Bio / Summary <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea placeholder="A short intro about yourself..." rows={3} value={summary} onChange={e => setSummary(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Job Types</Label>
                <div className="flex flex-wrap gap-2">
                  {['full-time', 'part-time', 'contract', 'internship'].map(type => (
                    <button key={type} onClick={() => toggleJobType(type)}
                      className={`px-3 py-1.5 rounded-lg border text-sm transition-all capitalize ${jobTypes.includes(type) ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:border-primary/50'}`}>
                      {type.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Step 2 — Location */}
          {!isCompany && step === 2 && (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Where are you based?</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>City <span className="text-destructive">*</span></Label>
                  <Input placeholder="e.g. New York" value={city} onChange={e => setCity(e.target.value)} autoFocus />
                </div>
                <div className="space-y-2">
                  <Label>Country <span className="text-destructive">*</span></Label>
                  <Select value={country} onValueChange={setCountry}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['USA','UK','CA','AU','DE','FR','IN','DZ','Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <button onClick={() => setRemote(!remote)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-sm ${remote ? 'bg-primary/10 border-primary' : 'border-border hover:border-primary/50'}`}>
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 ${remote ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                  {remote && <CheckCircle className="w-3 h-3 text-white" />}
                </div>
                Open to remote work
              </button>
            </>
          )}

          {/* Step 3 — Salary */}
          {!isCompany && step === 3 && (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2"><DollarSign className="w-4 h-4" /> What's your expected salary?</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Min</Label>
                  <Input type="number" placeholder="60000" value={salaryMin} onChange={e => setSalaryMin(e.target.value)} autoFocus />
                </div>
                <div className="space-y-2">
                  <Label>Max</Label>
                  <Input type="number" placeholder="90000" value={salaryMax} onChange={e => setSalaryMax(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {['USD','EUR','GBP','CAD','AUD','INR','DZD'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">This is optional — you can skip and update it later in Settings.</p>
            </>
          )}

          {/* Step 4 — Skills */}
          {!isCompany && step === 4 && (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2"><Code className="w-4 h-4" /> What are your key skills?</p>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. React, Python, Figma..."
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  autoFocus
                />
                <Button type="button" onClick={addSkill} size="sm"><Plus className="w-4 h-4" /></Button>
              </div>
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {skills.map(s => (
                    <Badge key={s} variant="secondary" className="gap-1 pr-1">
                      {s}
                      <button onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="hover:text-destructive ml-1">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
              {skills.length === 0 && <p className="text-xs text-muted-foreground">Press Enter or click + to add a skill. You can add as many as you like.</p>}
            </>
          )}

          {/* Step 5 — Work Experience */}
          {!isCompany && step === 5 && (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Add your work experience</p>
              {experiences.length > 0 && (
                <div className="space-y-2">
                  {experiences.map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted text-sm">
                      <div>
                        <p className="font-medium">{e.position}</p>
                        <p className="text-muted-foreground">{e.company}</p>
                      </div>
                      <button onClick={() => setExperiences(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3 p-3 rounded-lg border border-dashed">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Job Title</Label>
                    <Input placeholder="e.g. Frontend Dev" value={expForm.position} onChange={e => setExpForm(p => ({ ...p, position: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Company</Label>
                    <Input placeholder="e.g. Google" value={expForm.company} onChange={e => setExpForm(p => ({ ...p, company: e.target.value }))} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <Input type="month" value={expForm.startDate} onChange={e => setExpForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <Input type="month" value={expForm.endDate} disabled={expForm.current} onChange={e => setExpForm(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <button onClick={() => setExpForm(p => ({ ...p, current: !p.current, endDate: '' }))}
                  className={`flex items-center gap-2 text-sm px-2 py-1 rounded border transition-all ${expForm.current ? 'bg-primary/10 border-primary text-primary' : 'border-border'}`}>
                  <div className={`w-3 h-3 rounded border flex items-center justify-center ${expForm.current ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {expForm.current && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                  </div>
                  Currently working here
                </button>
                <div className="space-y-1">
                  <Label className="text-xs">Description <span className="text-muted-foreground">(optional)</span></Label>
                  <Textarea placeholder="What did you do there?" rows={2} value={expForm.description} onChange={e => setExpForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <Button size="sm" onClick={addExperience} disabled={!expForm.position || !expForm.company} className="w-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Experience
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Optional — you can add more later in Settings.</p>
            </>
          )}

          {/* Step 6 — Education */}
          {!isCompany && step === 6 && (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2"><GraduationCap className="w-4 h-4" /> Your education background</p>
              {educations.length > 0 && (
                <div className="space-y-2">
                  {educations.map((e, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted text-sm">
                      <div>
                        <p className="font-medium">{e.degree}</p>
                        <p className="text-muted-foreground">{e.institution}</p>
                      </div>
                      <button onClick={() => setEducations(prev => prev.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="space-y-3 p-3 rounded-lg border border-dashed">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Degree</Label>
                    <Input placeholder="e.g. Bachelor of Science" value={eduForm.degree} onChange={e => setEduForm(p => ({ ...p, degree: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Institution</Label>
                    <Input placeholder="e.g. MIT" value={eduForm.institution} onChange={e => setEduForm(p => ({ ...p, institution: e.target.value }))} />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Field of Study</Label>
                  <Input placeholder="e.g. Computer Science" value={eduForm.fieldOfStudy} onChange={e => setEduForm(p => ({ ...p, fieldOfStudy: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Start Date</Label>
                    <Input type="month" value={eduForm.startDate} onChange={e => setEduForm(p => ({ ...p, startDate: e.target.value }))} />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">End Date</Label>
                    <Input type="month" value={eduForm.endDate} disabled={eduForm.current} onChange={e => setEduForm(p => ({ ...p, endDate: e.target.value }))} />
                  </div>
                </div>
                <button onClick={() => setEduForm(p => ({ ...p, current: !p.current, endDate: '' }))}
                  className={`flex items-center gap-2 text-sm px-2 py-1 rounded border transition-all ${eduForm.current ? 'bg-primary/10 border-primary text-primary' : 'border-border'}`}>
                  <div className={`w-3 h-3 rounded border flex items-center justify-center ${eduForm.current ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                    {eduForm.current && <CheckCircle className="w-2.5 h-2.5 text-white" />}
                  </div>
                  Currently studying here
                </button>
                <Button size="sm" onClick={addEducation} disabled={!eduForm.degree || !eduForm.institution} className="w-full">
                  <Plus className="w-4 h-4 mr-1" /> Add Education
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Optional — you can add more later in Settings.</p>
            </>
          )}

          {/* ════ COMPANY STEPS ════ */}

          {/* Step 1 — Company Info */}
          {isCompany && step === 1 && (
            <>
              <p className="text-sm text-muted-foreground">Tell us about your company</p>
              <div className="space-y-2">
                <Label>Company Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Acme Corp" value={companyName} onChange={e => setCompanyName(e.target.value)} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Industry <span className="text-destructive">*</span></Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['Technology','Finance','Healthcare','Education','Manufacturing','Retail','Consulting','Other'].map(i => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Company Size</Label>
                  <Select value={companySize} onValueChange={setCompanySize}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['1-10','11-50','51-200','201-500','501-1000','1000+'].map(s => <SelectItem key={s} value={s}>{s} employees</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>What does your company do? <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea placeholder="Brief description..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
              </div>
            </>
          )}

          {/* Step 2 — Location */}
          {isCompany && step === 2 && (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="w-4 h-4" /> Where is your company based?</p>
              <div className="space-y-2">
                <Label>Headquarters <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. San Francisco, CA" value={headquarters} onChange={e => setHeadquarters(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label>Country</Label>
                <Select value={companyCountry} onValueChange={setCompanyCountry}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    {['USA','UK','CA','AU','DE','FR','IN','DZ','Other'].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Step 3 — Links */}
          {isCompany && step === 3 && (
            <>
              <p className="text-sm text-muted-foreground">Your company's online presence <span className="text-xs">(all optional)</span></p>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe className="w-4 h-4" /> Website</Label>
                <Input placeholder="https://yourcompany.com" value={website} onChange={e => setWebsite(e.target.value)} autoFocus />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Linkedin className="w-4 h-4" /> LinkedIn</Label>
                <Input placeholder="https://linkedin.com/company/yourcompany" value={linkedin} onChange={e => setLinkedin(e.target.value)} />
              </div>
            </>
          )}

          {/* Step 4 — First Job Posting */}
          {isCompany && step === 4 && (
            <>
              <p className="text-sm text-muted-foreground flex items-center gap-2"><Briefcase className="w-4 h-4" /> Post your first job <span className="text-xs">(optional)</span></p>
              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input placeholder="e.g. Frontend Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Job Type</Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {['full-time','part-time','contract','internship'].map(t => <SelectItem key={t} value={t} className="capitalize">{t.replace('-',' ')}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input placeholder="e.g. Remote / New York" value={jobLocation} onChange={e => setJobLocation(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description <span className="text-muted-foreground text-xs">(optional)</span></Label>
                <Textarea placeholder="What will this person be doing?" rows={3} value={jobDesc} onChange={e => setJobDesc(e.target.value)} />
              </div>
              <p className="text-xs text-muted-foreground">You can create and manage jobs anytime from the Job Management section.</p>
            </>
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t border-border">
          {step > 1
            ? <Button variant="outline" onClick={() => setStep(s => s - 1)}>Back</Button>
            : <Button variant="ghost" onClick={handleFinish} className="text-muted-foreground text-sm">Skip for now</Button>
          }
          {step < totalSteps
            ? <Button onClick={() => setStep(s => s + 1)} disabled={!canProceed()}>
                Continue <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            : <Button onClick={handleFinish}>
                Get Started <CheckCircle className="w-4 h-4 ml-2" />
              </Button>
          }
        </div>
      </DialogContent>
    </Dialog>
  );
}
