import { useState } from 'react';
import { useMockData } from '@/hooks/useMockData';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  FileText,
  Download,
  Eye,
  CheckCircle,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Sparkles,
  Palette,
  Layout,
  Type,
  Monitor,
  Settings,
  ExternalLink,
  Loader2,
} from 'lucide-react';
import { generateProfileSummary } from '@/lib/gemini';

function toDate(v: any): Date {
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
}

const templates = [
  { id: 'modern', name: 'Modern Professional', preview: 'modern', color: 'from-blue-500 to-indigo-600', icon: Monitor },
  { id: 'classic', name: 'Classic Elegant', preview: 'classic', color: 'from-slate-600 to-slate-800', icon: Type },
  { id: 'creative', name: 'Creative Bold', preview: 'creative', color: 'from-purple-500 to-pink-600', icon: Palette },
  { id: 'minimal', name: 'Minimal Clean', preview: 'minimal', color: 'from-emerald-500 to-teal-600', icon: Layout },
];

interface CVGeneratorProps {
  onNavigateToSettings?: () => void;
}

export function CVGenerator({ onNavigateToSettings }: CVGeneratorProps) {
  const { profile, badges, updateProfile } = useMockData();
  const { user } = useAuth();
  const [selectedTemplate, setSelectedTemplate] = useState('modern');
  const [showPreview, setShowPreview] = useState(false);
  const [activeTab, setActiveTab] = useState('templates');
  const [exportSettings, setExportSettings] = useState({
    includeContact: true,
    includeBadges: true,
    atsOptimized: true,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  const handleGenerateSummary = async () => {
    setSummaryLoading(true);
    try {
      const expText = profile.workExperience
        .map(e => `${e.position} at ${e.company}`)
        .join(', ');
      const text = await generateProfileSummary(
        profile.workExperience[0]?.position || 'Professional',
        profile.skills.slice(0, 6).map(s => s.name),
        expText,
      );
      updateProfile({ summary: text });
    } catch {
      // silently fail
    } finally {
      setSummaryLoading(false);
    }
  };

  const getBadgeClass = (level: string) => {
    switch (level) {
      case 'bronze': return 'bg-gradient-to-r from-amber-600 to-amber-700';
      case 'silver': return 'bg-gradient-to-r from-slate-400 to-slate-500';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-amber-500';
      case 'platinum': return 'bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500';
      default: return 'bg-muted';
    }
  };

  const renderCVPreview = () => {
    if (selectedTemplate === 'classic') return renderClassicCV();
    if (selectedTemplate === 'creative') return renderCreativeCV();
    if (selectedTemplate === 'minimal') return renderMinimalCV();
    return renderModernCV();
  };

  const renderModernCV = () => (
    <div className="bg-white text-slate-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="border-b-2 border-blue-500 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-blue-700">{profile.workExperience[0]?.position || 'Professional'}</h1>
        <p className="text-lg text-slate-500 mt-1">{profile.headline}</p>
        {exportSettings.includeContact && (
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-600">
            {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-blue-500" />{profile.location.city}, {profile.location.region}</span>}
            {profile.phone && <span className="flex items-center gap-1"><Phone className="w-4 h-4 text-blue-500" />{profile.phone}</span>}
            <span className="flex items-center gap-1"><Mail className="w-4 h-4 text-blue-500" />{user?.email}</span>
            {profile.linkedIn && <span className="flex items-center gap-1"><Linkedin className="w-4 h-4 text-blue-500" />{profile.linkedIn}</span>}
          </div>
        )}
      </div>
      {profile.summary && <div className="mb-6"><h2 className="text-base font-bold text-blue-700 uppercase tracking-wider mb-2">Summary</h2><p className="text-slate-700 text-sm leading-relaxed">{profile.summary}</p></div>}
      <div className="mb-6">
        <h2 className="text-base font-bold text-blue-700 uppercase tracking-wider mb-3">Experience</h2>
        <div className="space-y-4">{profile.workExperience.map(exp => (
          <div key={exp.id}>
            <div className="flex justify-between"><div><p className="font-semibold">{exp.position}</p><p className="text-sm text-slate-500">{exp.company} • {exp.location}</p></div>
            <span className="text-xs text-slate-400">{toDate(exp.startDate).getFullYear()} – {exp.current ? 'Present' : exp.endDate ? toDate(exp.endDate).getFullYear() : ''}</span></div>
            <p className="text-sm text-slate-600 mt-1">{exp.description}</p>
          </div>
        ))}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-base font-bold text-blue-700 uppercase tracking-wider mb-3">Education</h2>
        <div className="space-y-3">{profile.education.map(edu => (
          <div key={edu.id} className="flex justify-between">
            <div><p className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</p><p className="text-sm text-slate-500">{edu.institution}</p></div>
            <span className="text-xs text-slate-400">{toDate(edu.startDate).getFullYear()} – {edu.current ? 'Present' : edu.endDate ? toDate(edu.endDate).getFullYear() : ''}</span>
          </div>
        ))}</div>
      </div>
      <div>
        <h2 className="text-base font-bold text-blue-700 uppercase tracking-wider mb-2">Skills</h2>
        <div className="flex flex-wrap gap-2">{profile.skills.map(s => <span key={s.id} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-200">{s.name}</span>)}</div>
      </div>
    </div>
  );

  const renderClassicCV = () => (
    <div className="bg-white text-slate-900 p-8 rounded-lg shadow-lg max-w-2xl mx-auto font-serif">
      <div className="text-center border-b-2 border-slate-800 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-slate-900 tracking-wide">{user?.firstName} {user?.lastName}</h1>
        <p className="text-slate-600 mt-1 italic">{profile.headline}</p>
        {exportSettings.includeContact && (
          <div className="flex justify-center flex-wrap gap-4 mt-3 text-sm text-slate-600">
            {profile.phone && <span>{profile.phone}</span>}
            <span>{user?.email}</span>
            {profile.location && <span>{profile.location.city}, {profile.location.region}</span>}
          </div>
        )}
      </div>
      {profile.summary && <div className="mb-6"><h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Professional Summary</h2><p className="text-slate-700 text-sm leading-relaxed italic">{profile.summary}</p></div>}
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Work Experience</h2>
        <div className="space-y-4">{profile.workExperience.map(exp => (
          <div key={exp.id}>
            <div className="flex justify-between"><p className="font-bold">{exp.position}</p><span className="text-sm text-slate-500">{toDate(exp.startDate).getFullYear()} – {exp.current ? 'Present' : exp.endDate ? toDate(exp.endDate).getFullYear() : ''}</span></div>
            <p className="text-sm text-slate-600 italic">{exp.company}, {exp.location}</p>
            <p className="text-sm text-slate-700 mt-1">{exp.description}</p>
          </div>
        ))}</div>
      </div>
      <div className="mb-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-3">Education</h2>
        <div className="space-y-2">{profile.education.map(edu => (
          <div key={edu.id} className="flex justify-between">
            <div><p className="font-bold">{edu.degree} in {edu.fieldOfStudy}</p><p className="text-sm italic text-slate-600">{edu.institution}</p></div>
            <span className="text-sm text-slate-500">{toDate(edu.startDate).getFullYear()} – {edu.current ? 'Present' : edu.endDate ? toDate(edu.endDate).getFullYear() : ''}</span>
          </div>
        ))}</div>
      </div>
      <div>
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-widest border-b border-slate-300 pb-1 mb-2">Skills</h2>
        <p className="text-sm text-slate-700">{profile.skills.map(s => s.name).join(' • ')}</p>
      </div>
    </div>
  );

  const renderCreativeCV = () => (
    <div className="bg-white text-slate-900 rounded-lg shadow-lg max-w-2xl mx-auto overflow-hidden">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-8">
        <h1 className="text-3xl font-bold">{user?.firstName} {user?.lastName}</h1>
        <p className="text-purple-100 mt-1">{profile.headline}</p>
        {exportSettings.includeContact && (
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-purple-100">
            {profile.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{profile.phone}</span>}
            <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{user?.email}</span>
            {profile.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{profile.location.city}</span>}
          </div>
        )}
      </div>
      <div className="p-8">
        {profile.summary && <div className="mb-6 p-4 bg-purple-50 rounded-xl border-l-4 border-purple-500"><p className="text-slate-700 text-sm leading-relaxed">{profile.summary}</p></div>}
        <div className="mb-6">
          <h2 className="text-base font-bold text-purple-600 mb-3 flex items-center gap-2"><Briefcase className="w-4 h-4" />Experience</h2>
          <div className="space-y-4">{profile.workExperience.map(exp => (
            <div key={exp.id} className="pl-4 border-l-2 border-pink-300">
              <p className="font-bold text-slate-900">{exp.position}</p>
              <p className="text-sm text-pink-600">{exp.company} • {toDate(exp.startDate).getFullYear()} – {exp.current ? 'Present' : exp.endDate ? toDate(exp.endDate).getFullYear() : ''}</p>
              <p className="text-sm text-slate-600 mt-1">{exp.description}</p>
            </div>
          ))}</div>
        </div>
        <div className="mb-6">
          <h2 className="text-base font-bold text-purple-600 mb-3 flex items-center gap-2"><GraduationCap className="w-4 h-4" />Education</h2>
          <div className="space-y-2">{profile.education.map(edu => (
            <div key={edu.id} className="pl-4 border-l-2 border-pink-300">
              <p className="font-bold">{edu.degree} in {edu.fieldOfStudy}</p>
              <p className="text-sm text-pink-600">{edu.institution} • {toDate(edu.startDate).getFullYear()} – {edu.current ? 'Present' : edu.endDate ? toDate(edu.endDate).getFullYear() : ''}</p>
            </div>
          ))}</div>
        </div>
        <div>
          <h2 className="text-base font-bold text-purple-600 mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">{profile.skills.map(s => <span key={s.id} className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-xs font-medium">{s.name}</span>)}</div>
        </div>
      </div>
    </div>
  );

  const renderMinimalCV = () => (
    <div className="bg-white text-slate-900 p-10 rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-light text-slate-900 tracking-tight">{user?.firstName} {user?.lastName}</h1>
        <p className="text-slate-400 mt-1 text-sm">{profile.headline}</p>
        {exportSettings.includeContact && (
          <div className="flex flex-wrap gap-4 mt-3 text-xs text-slate-400">
            {profile.phone && <span>{profile.phone}</span>}
            <span>{user?.email}</span>
            {profile.location && <span>{profile.location.city}, {profile.location.region}</span>}
          </div>
        )}
      </div>
      {profile.summary && <div className="mb-8"><p className="text-slate-600 text-sm leading-relaxed border-l-2 border-slate-200 pl-4">{profile.summary}</p></div>}
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Experience</h2>
        <div className="space-y-5">{profile.workExperience.map(exp => (
          <div key={exp.id}>
            <div className="flex justify-between items-baseline"><p className="font-medium text-slate-900">{exp.position}</p><span className="text-xs text-slate-400">{toDate(exp.startDate).getFullYear()} – {exp.current ? 'Present' : exp.endDate ? toDate(exp.endDate).getFullYear() : ''}</span></div>
            <p className="text-xs text-slate-400 mt-0.5">{exp.company}</p>
            <p className="text-sm text-slate-600 mt-1">{exp.description}</p>
          </div>
        ))}</div>
      </div>
      <div className="mb-8">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">Education</h2>
        <div className="space-y-3">{profile.education.map(edu => (
          <div key={edu.id} className="flex justify-between items-baseline">
            <div><p className="font-medium">{edu.degree} in {edu.fieldOfStudy}</p><p className="text-xs text-slate-400">{edu.institution}</p></div>
            <span className="text-xs text-slate-400">{toDate(edu.startDate).getFullYear()} – {edu.current ? 'Present' : edu.endDate ? toDate(edu.endDate).getFullYear() : ''}</span>
          </div>
        ))}</div>
      </div>
      <div>
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">Skills</h2>
        <div className="flex flex-wrap gap-2">{profile.skills.map(s => <span key={s.id} className="text-xs text-slate-600 border border-slate-200 px-2 py-0.5 rounded">{s.name}</span>)}</div>
      </div>
    </div>
  );

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">CV Generator</h2>
          <p className="text-muted-foreground">Create professional, ATS-optimized resumes</p>
        </div>
        <div className="flex gap-2">
          {onNavigateToSettings && (
            <Button variant="outline" onClick={onNavigateToSettings}>
              <Settings className="w-4 h-4 mr-2" />
              Edit Profile
              <ExternalLink className="w-3 h-3 ml-1 opacity-60" />
            </Button>
          )}
          <Dialog open={showPreview} onOpenChange={setShowPreview}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>CV Preview</DialogTitle>
              </DialogHeader>
              {renderCVPreview()}
            </DialogContent>
          </Dialog>
          <Button>
            <Download className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Export Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map((template) => {
              const Icon = template.icon;
              return (
                <Card
                  key={template.id}
                  className={`cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? 'ring-2 ring-primary border-primary'
                      : 'hover:border-primary/50'
                  }`}
                  onClick={() => setSelectedTemplate(template.id)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-20 rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center shadow-lg`}>
                        <FileText className="w-8 h-8 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{template.name}</h3>
                          {selectedTemplate === template.id && (
                            <CheckCircle className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Professional design optimized for {template.id === 'modern' ? 'tech' : template.id === 'classic' ? 'traditional' : 'modern'} industries
                        </p>
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="secondary" className="text-xs">
                            <Icon className="w-3 h-3 mr-1" />
                            {template.id}
                          </Badge>
                          <Badge variant="outline" className="text-xs">ATS Friendly</Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                AI-Powered Suggestions
              </CardTitle>
              <CardDescription>
                Our AI analyzes your profile to suggest improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  'Add quantifiable achievements to your work experience',
                  'Include 2-3 more technical skills for better ATS matching',
                  'Your summary could be more impactful with action verbs',
                ].map((suggestion, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                    <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                    <span className="text-sm">{suggestion}</span>
                  </div>
                ))}
              </div>
              <Button className="mt-4 w-full" variant="outline" onClick={handleGenerateSummary} disabled={summaryLoading}>
                {summaryLoading
                  ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Writing summary...</>
                  : <><Sparkles className="w-4 h-4 mr-2" />AI Write My Summary</>}
              </Button>
              {profile.summary && (
                <p className="mt-3 text-sm text-muted-foreground bg-muted rounded-lg p-3">{profile.summary}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content" className="space-y-6">
          {/* Edit in Settings banner */}
          {onNavigateToSettings && (
            <div className="flex items-center justify-between p-4 rounded-lg border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-3">
                <Settings className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">Want to update your information?</p>
                  <p className="text-xs text-muted-foreground">Changes to experience, education and skills are made in Settings</p>
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={onNavigateToSettings}>
                Go to Settings
                <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.workExperience.map((exp) => (
                    <div key={exp.id} className="p-4 rounded-lg border border-border/50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{exp.position}</p>
                          <p className="text-sm text-muted-foreground">{exp.company}</p>
                        </div>
                        <Badge variant="outline">
                          {exp.current ? 'Current' : 'Past'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profile.education.map((edu) => (
                    <div key={edu.id} className="p-4 rounded-lg border border-border/50">
                      <p className="font-medium">{edu.degree} in {edu.fieldOfStudy}</p>
                      <p className="text-sm text-muted-foreground">{edu.institution}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Skills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <Badge key={skill.id} variant="secondary">
                      {skill.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Badges
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {badges.map((badge) => (
                    <Badge key={badge.id} className={`${getBadgeClass(badge.level)} text-white`}>
                      {badge.name}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Export Settings</CardTitle>
              <CardDescription>Configure what gets included when you export your CV</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">Include Contact Information</p>
                  <p className="text-sm text-muted-foreground">Phone, email, and address</p>
                </div>
                <Switch
                  checked={exportSettings.includeContact}
                  onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, includeContact: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">Include Badges</p>
                  <p className="text-sm text-muted-foreground">Show verified skill badges</p>
                </div>
                <Switch
                  checked={exportSettings.includeBadges}
                  onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, includeBadges: checked }))}
                />
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                <div>
                  <p className="font-medium">ATS Optimization</p>
                  <p className="text-sm text-muted-foreground">Optimize for applicant tracking systems</p>
                </div>
                <Switch
                  checked={exportSettings.atsOptimized}
                  onCheckedChange={(checked) => setExportSettings(prev => ({ ...prev, atsOptimized: checked }))}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
