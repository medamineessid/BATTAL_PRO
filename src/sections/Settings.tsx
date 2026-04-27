import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useMockData } from '@/hooks/useMockData';
import {
  addSkill as apiAddSkill,
  deleteSkill as apiDeleteSkill,
  addExperience as apiAddExperience,
  deleteExperience as apiDeleteExperience,
  addEducation as apiAddEducation,
  deleteEducation as apiDeleteEducation,
} from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  User,
  Briefcase,
  GraduationCap,
  Code,
  Bell,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Link,
  Camera,
  Plus,
  Trash2,
  CheckCircle,
  DollarSign,
  Eye,
  Save,
  RotateCcw,
  Sparkles,
  Palette,
} from 'lucide-react';

function toDate(v: any): Date {
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? new Date() : d;
}

export function Settings() {
  const { user } = useAuth();
  const { profile, updateProfile } = useMockData();
  const [activeTab, setActiveTab] = useState('profile');
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddExperience, setShowAddExperience] = useState(false);
  const [showAddEducation, setShowAddEducation] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(user?.avatar);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be under 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  // New experience form state
  const [newExp, setNewExp] = useState({ position: '', company: '', location: '', startDate: '', endDate: '', description: '' });
  // New education form state
  const [newEdu, setNewEdu] = useState({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '' });

  // Local state for form data
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    headline: profile.headline || '',
    summary: profile.summary || '',
    phone: profile.phone || '',
    linkedIn: profile.linkedIn || '',
    portfolio: profile.portfolio || '',
    city: profile.location.city || '',
    region: profile.location.region || '',
    country: profile.location.country || '',
    remote: profile.location.remote || false,
    salaryMin: profile.expectedSalary?.min || 0,
    salaryMax: profile.expectedSalary?.max || 150000,
    currency: profile.expectedSalary?.currency || 'USD',
    jobTypes: profile.preferences.jobTypes || [],
    industries: profile.preferences.industries || [],
    companySizes: profile.preferences.companySizes || [],
  });

  // Notification settings
  const [notifications, setNotifications] = useState({
    jobMatches: true,
    applicationUpdates: true,
    messages: true,
    marketingEmails: false,
    profileViews: true,
    newBadges: true,
  });

  // Privacy settings
  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showSalary: false,
    showContactInfo: false,
    allowRecruiters: true,
    showBadges: true,
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateProfile({
      headline: formData.headline,
      summary: formData.summary,
      phone: formData.phone,
      linkedIn: formData.linkedIn,
      portfolio: formData.portfolio,
      location: {
        city: formData.city,
        region: formData.region,
        country: formData.country,
        remote: formData.remote,
      },
      expectedSalary: {
        min: formData.salaryMin,
        max: formData.salaryMax,
        currency: formData.currency,
      },
      preferences: {
        jobTypes: formData.jobTypes as any,
        industries: formData.industries,
        companySizes: formData.companySizes as any,
      },
    });
    setHasChanges(false);
  };

  const handleReset = () => {
    setFormData({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
      headline: profile.headline || '',
      summary: profile.summary || '',
      phone: profile.phone || '',
      linkedIn: profile.linkedIn || '',
      portfolio: profile.portfolio || '',
      city: profile.location.city || '',
      region: profile.location.region || '',
      country: profile.location.country || '',
      remote: profile.location.remote || false,
      salaryMin: profile.expectedSalary?.min || 0,
      salaryMax: profile.expectedSalary?.max || 150000,
      currency: profile.expectedSalary?.currency || 'USD',
      jobTypes: profile.preferences.jobTypes || [],
      industries: profile.preferences.industries || [],
      companySizes: profile.preferences.companySizes || [],
    });
    setHasChanges(false);
  };

  const getRealUserId = () => {
    try {
      const stored = localStorage.getItem('auth_user');
      if (!stored) return null;
      const u = JSON.parse(stored);
      if (u.id.startsWith('demo_') || u.id.startsWith('local_')) return null;
      return u.id as string;
    } catch { return null; }
  };

  const handleDeleteExperience = (id: string) => {
    updateProfile({ workExperience: profile.workExperience.filter(e => e.id !== id) });
    const uid = getRealUserId();
    if (uid) apiDeleteExperience(id).catch(console.warn);
  };

  const handleDeleteEducation = (id: string) => {
    updateProfile({ education: profile.education.filter(e => e.id !== id) });
    const uid = getRealUserId();
    if (uid) apiDeleteEducation(id).catch(console.warn);
  };

  const handleAddExperience = () => {
    if (!newExp.position || !newExp.company) return;
    const entry = {
      id: Date.now().toString(),
      company: newExp.company,
      position: newExp.position,
      location: newExp.location,
      startDate: newExp.startDate ? new Date(newExp.startDate) : new Date(),
      endDate: newExp.endDate ? new Date(newExp.endDate) : undefined,
      current: !newExp.endDate,
      description: newExp.description,
      achievements: [],
    };
    updateProfile({ workExperience: [...profile.workExperience, entry] });
    const uid = getRealUserId();
    if (uid) {
      apiAddExperience(uid, {
        company: entry.company,
        position: entry.position,
        location: entry.location,
        start_date: entry.startDate.toISOString().split('T')[0],
        end_date: entry.endDate ? entry.endDate.toISOString().split('T')[0] : undefined,
        current: entry.current,
        description: entry.description,
        achievements: [],
      }).catch(console.warn);
    }
    setNewExp({ position: '', company: '', location: '', startDate: '', endDate: '', description: '' });
    setShowAddExperience(false);
  };

  const handleAddEducation = () => {
    if (!newEdu.institution || !newEdu.degree) return;
    const entry = {
      id: Date.now().toString(),
      institution: newEdu.institution,
      degree: newEdu.degree,
      fieldOfStudy: newEdu.fieldOfStudy,
      startDate: newEdu.startDate ? new Date(newEdu.startDate) : new Date(),
      endDate: newEdu.endDate ? new Date(newEdu.endDate) : undefined,
      current: !newEdu.endDate,
      gpa: newEdu.gpa ? parseFloat(newEdu.gpa) : undefined,
    };
    updateProfile({ education: [...profile.education, entry] });
    const uid = getRealUserId();
    if (uid) {
      apiAddEducation(uid, {
        institution: entry.institution,
        degree: entry.degree,
        field_of_study: entry.fieldOfStudy,
        start_date: entry.startDate.toISOString().split('T')[0],
        end_date: entry.endDate ? entry.endDate.toISOString().split('T')[0] : undefined,
        current: entry.current,
        gpa: entry.gpa,
      }).catch(console.warn);
    }
    setNewEdu({ institution: '', degree: '', fieldOfStudy: '', startDate: '', endDate: '', gpa: '' });
    setShowAddEducation(false);
  };

  const handleDeleteSkill = (id: string) => {
    updateProfile({ skills: profile.skills.filter(s => s.id !== id) });
    const uid = getRealUserId();
    if (uid) apiDeleteSkill(id).catch(console.warn);
  };

  const handleAddSkill = (name: string, category: 'technical' | 'soft' | 'language') => {
    if (!name.trim()) return;
    const newSkill = { id: Date.now().toString(), name: name.trim(), category, proficiency: 50 };
    updateProfile({ skills: [...profile.skills, newSkill] });
    const uid = getRealUserId();
    if (uid) apiAddSkill(uid, { name: newSkill.name, category, proficiency: 50 }).catch(console.warn);
  };

  const toggleJobType = (type: string) => {
    const current = formData.jobTypes;
    const updated = current.includes(type as any)
      ? current.filter(t => t !== type)
      : [...current, type];
    handleInputChange('jobTypes', updated);
  };

  const toggleIndustry = (industry: string) => {
    const current = formData.industries;
    const updated = current.includes(industry)
      ? current.filter(i => i !== industry)
      : [...current, industry];
    handleInputChange('industries', updated);
  };

  const toggleCompanySize = (size: string) => {
    const current = formData.companySizes;
    const updated = current.includes(size as any)
      ? current.filter(s => s !== size)
      : [...current, size];
    handleInputChange('companySizes', updated);
  };

  return (
    <div className="animate-slide-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Settings</h2>
          <p className="text-muted-foreground">Manage your profile and preferences</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 lg:w-auto">
          <TabsTrigger value="profile" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="experience" className="gap-2">
            <Briefcase className="w-4 h-4" />
            <span className="hidden sm:inline">Experience</span>
          </TabsTrigger>
          <TabsTrigger value="education" className="gap-2">
            <GraduationCap className="w-4 h-4" />
            <span className="hidden sm:inline">Education</span>
          </TabsTrigger>
          <TabsTrigger value="skills" className="gap-2">
            <Code className="w-4 h-4" />
            <span className="hidden sm:inline">Skills</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Palette className="w-4 h-4" />
            <span className="hidden sm:inline">Preferences</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          {/* Profile Photo */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
              <CardDescription>This will be visible to recruiters and employers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="relative">
                  <Avatar className="w-24 h-24">
                    <AvatarImage src={avatarPreview} />
                    <AvatarFallback className="text-2xl">{user?.firstName?.[0]}{user?.lastName?.[0]}</AvatarFallback>
                  </Avatar>
                  <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors cursor-pointer">
                    <Camera className="w-4 h-4" />
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                </div>
                <div>
                  <label>
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Camera className="w-4 h-4 mr-2" />
                        Upload Photo
                      </span>
                    </Button>
                    <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                  </label>
                  <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 2MB.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="headline">Professional Headline</Label>
                <Input
                  id="headline"
                  placeholder="e.g., Senior Full Stack Developer"
                  value={formData.headline}
                  onChange={(e) => handleInputChange('headline', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  placeholder="Write a brief summary about yourself..."
                  rows={4}
                  value={formData.summary}
                  onChange={(e) => handleInputChange('summary', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
              <CardDescription>How employers can reach you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="linkedIn" className="flex items-center gap-2">
                  <Linkedin className="w-4 h-4" />
                  LinkedIn Profile
                </Label>
                <Input
                  id="linkedIn"
                  placeholder="linkedin.com/in/yourprofile"
                  value={formData.linkedIn}
                  onChange={(e) => handleInputChange('linkedIn', e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="portfolio" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Portfolio / Website
                </Label>
                <Input
                  id="portfolio"
                  placeholder="yourportfolio.com"
                  value={formData.portfolio}
                  onChange={(e) => handleInputChange('portfolio', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Location</CardTitle>
              <CardDescription>Where you're based and work preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">State/Region</Label>
                  <Input
                    id="region"
                    value={formData.region}
                    onChange={(e) => handleInputChange('region', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => handleInputChange('country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USA">United States</SelectItem>
                      <SelectItem value="UK">United Kingdom</SelectItem>
                      <SelectItem value="CA">Canada</SelectItem>
                      <SelectItem value="AU">Australia</SelectItem>
                      <SelectItem value="DE">Germany</SelectItem>
                      <SelectItem value="FR">France</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted">
                <Switch
                  checked={formData.remote}
                  onCheckedChange={(checked) => handleInputChange('remote', checked)}
                />
                <div>
                  <p className="font-medium">Open to Remote Work</p>
                  <p className="text-sm text-muted-foreground">Show remote positions in job matches</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Expectations */}
          <Card>
            <CardHeader>
              <CardTitle>Salary Expectations</CardTitle>
              <CardDescription>Your desired compensation range</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Minimum</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={formData.salaryMin}
                      onChange={(e) => handleInputChange('salaryMin', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Maximum</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      className="pl-9"
                      value={formData.salaryMax}
                      onChange={(e) => handleInputChange('salaryMax', parseInt(e.target.value))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value) => handleInputChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="CAD">CAD (C$)</SelectItem>
                      <SelectItem value="AUD">AUD (A$)</SelectItem>
                      <SelectItem value="INR">INR (₹)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Experience Tab */}
        <TabsContent value="experience" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Work Experience</h3>
              <p className="text-sm text-muted-foreground">{profile.workExperience.length} positions added</p>
            </div>
            <Button onClick={() => setShowAddExperience(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          </div>

          <div className="space-y-4">
            {profile.workExperience.map((exp) => (
              <Card key={exp.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{exp.position}</h4>
                        {exp.current && (
                          <Badge variant="secondary" className="text-xs">Current</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{exp.company}</p>
                      <p className="text-sm text-muted-foreground">
                        {toDate(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                        {exp.current ? 'Present' : exp.endDate ? toDate(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                      </p>
                      <p className="text-sm text-muted-foreground">{exp.location}</p>
                      <p className="mt-2 text-sm">{exp.description}</p>
                      {exp.achievements.length > 0 && (
                        <ul className="mt-2 space-y-1">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                              <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                              {achievement}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteExperience(exp.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Education Tab */}
        <TabsContent value="education" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Education</h3>
              <p className="text-sm text-muted-foreground">{profile.education.length} degrees added</p>
            </div>
            <Button onClick={() => setShowAddEducation(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Education
            </Button>
          </div>

          <div className="space-y-4">
            {profile.education.map((edu) => (
              <Card key={edu.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold">{edu.degree} in {edu.fieldOfStudy}</h4>
                      <p className="text-muted-foreground">{edu.institution}</p>
                      <p className="text-sm text-muted-foreground">
                        {toDate(edu.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })} - 
                        {edu.current ? 'Present' : edu.endDate ? toDate(edu.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''}
                      </p>
                      {edu.gpa && (
                        <p className="text-sm text-muted-foreground mt-1">GPA: {edu.gpa}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteEducation(edu.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Skills Tab */}
        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Technical Skills</CardTitle>
              <CardDescription>Add your technical skills and proficiency levels</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.filter(s => s.category === 'technical').map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors group"
                  >
                    <span>{skill.name}</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          className={`w-3 h-3 rounded-full ${
                            star <= Math.ceil(skill.proficiency / 20)
                              ? 'bg-primary'
                              : 'bg-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                    <button className="text-destructive transition-opacity" onClick={() => handleDeleteSkill(skill.id)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="newTechSkill" placeholder="Add a technical skill..." className="max-w-xs" />
                <Button onClick={() => {
                  const input = document.getElementById('newTechSkill') as HTMLInputElement;
                  handleAddSkill(input.value, 'technical');
                  input.value = '';
                }}>Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Soft Skills</CardTitle>
              <CardDescription>Communication, leadership, and interpersonal skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.filter(s => s.category === 'soft').map((skill) => (
                  <Badge key={skill.id} variant="secondary" className="px-3 py-2">
                    {skill.name}
                    <button className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSkill(skill.id)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="newSoftSkill" placeholder="Add a soft skill..." className="max-w-xs" />
                <Button onClick={() => {
                  const input = document.getElementById('newSoftSkill') as HTMLInputElement;
                  handleAddSkill(input.value, 'soft');
                  input.value = '';
                }}>Add</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Languages</CardTitle>
              <CardDescription>Languages you speak and your proficiency</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 mb-4">
                {profile.skills.filter(s => s.category === 'language').map((skill) => (
                  <Badge key={skill.id} variant="outline" className="px-3 py-2">
                    {skill.name}
                    <span className="ml-2 text-muted-foreground">{skill.proficiency}%</span>
                    <button className="ml-2 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteSkill(skill.id)}>
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input id="newLangSkill" placeholder="Add a language..." className="max-w-xs" />
                <Button onClick={() => {
                  const input = document.getElementById('newLangSkill') as HTMLInputElement;
                  handleAddSkill(input.value, 'language');
                  input.value = '';
                }}>Add</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Job Type Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Job Type Preferences</CardTitle>
              <CardDescription>What types of positions are you looking for?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {['full-time', 'part-time', 'contract', 'internship'].map((type) => (
                  <button
                    key={type}
                    onClick={() => toggleJobType(type)}
                    className={`px-4 py-2 rounded-lg border transition-all ${
                      formData.jobTypes.includes(type as any)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="capitalize">{type.replace('-', ' ')}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Industry Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Industry Preferences</CardTitle>
              <CardDescription>Which industries interest you?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Media', 'Consulting'].map((industry) => (
                  <button
                    key={industry}
                    onClick={() => toggleIndustry(industry)}
                    className={`px-3 py-2 rounded-lg border transition-all ${
                      formData.industries.includes(industry)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-transparent border-border hover:border-primary/50'
                    }`}
                  >
                    {industry}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Company Size */}
          <Card>
            <CardHeader>
              <CardTitle>Company Size Preference</CardTitle>
              <CardDescription>What size companies do you prefer?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                {[
                  { id: 'startup', label: 'Startup (1-50)', desc: 'Fast-paced, high growth' },
                  { id: 'sme', label: 'SME (51-500)', desc: 'Established but agile' },
                  { id: 'enterprise', label: 'Enterprise (500+)', desc: 'Stable, structured' },
                ].map((size) => (
                  <button
                    key={size.id}
                    onClick={() => toggleCompanySize(size.id)}
                    className={`flex-1 min-w-[200px] p-4 rounded-lg border text-left transition-all ${
                      formData.companySizes.includes(size.id as any)
                        ? 'bg-primary/10 border-primary'
                        : 'bg-transparent border-border hover:border-primary/50'
                    }`}
                  >
                    <p className="font-medium">{size.label}</p>
                    <p className="text-sm text-muted-foreground">{size.desc}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Privacy Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy Settings</CardTitle>
              <CardDescription>Control what others can see about you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Public Profile</p>
                  <p className="text-sm text-muted-foreground">Allow recruiters to find your profile</p>
                </div>
                <Switch
                  checked={privacy.publicProfile}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, publicProfile: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Show Salary Expectations</p>
                  <p className="text-sm text-muted-foreground">Display your salary range on your profile</p>
                </div>
                <Switch
                  checked={privacy.showSalary}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, showSalary: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Show Contact Information</p>
                  <p className="text-sm text-muted-foreground">Make phone and email visible to recruiters</p>
                </div>
                <Switch
                  checked={privacy.showContactInfo}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, showContactInfo: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Allow Recruiter Messages</p>
                  <p className="text-sm text-muted-foreground">Receive direct messages from recruiters</p>
                </div>
                <Switch
                  checked={privacy.allowRecruiters}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, allowRecruiters: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Show Badges</p>
                  <p className="text-sm text-muted-foreground">Display your earned skill badges</p>
                </div>
                <Switch
                  checked={privacy.showBadges}
                  onCheckedChange={(checked) => setPrivacy({ ...privacy, showBadges: checked })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Choose what emails you want to receive</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Job Matches</p>
                    <p className="text-sm text-muted-foreground">New jobs that match your profile</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.jobMatches}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, jobMatches: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-medium">Application Updates</p>
                    <p className="text-sm text-muted-foreground">Status changes on your applications</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.applicationUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, applicationUpdates: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-medium">Messages</p>
                    <p className="text-sm text-muted-foreground">Direct messages from recruiters</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.messages}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, messages: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-medium">Profile Views</p>
                    <p className="text-sm text-muted-foreground">When recruiters view your profile</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.profileViews}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, profileViews: checked })}
                />
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="font-medium">New Badges</p>
                    <p className="text-sm text-muted-foreground">When you earn a new skill badge</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.newBadges}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, newBadges: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Marketing Emails</p>
                    <p className="text-sm text-muted-foreground">Tips, news, and promotional content</p>
                  </div>
                </div>
                <Switch
                  checked={notifications.marketingEmails}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, marketingEmails: checked })}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Browser and mobile notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium">Enable Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive notifications in your browser</p>
                </div>
                <Button variant="outline" size="sm">
                  Enable
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Experience Dialog */}
      <Dialog open={showAddExperience} onOpenChange={setShowAddExperience}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Work Experience</DialogTitle>
            <DialogDescription>Add a new position to your profile</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Job Title</Label>
              <Input placeholder="e.g., Senior Software Engineer" value={newExp.position} onChange={e => setNewExp(p => ({ ...p, position: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Company</Label>
              <Input placeholder="e.g., Google" value={newExp.company} onChange={e => setNewExp(p => ({ ...p, company: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={newExp.startDate} onChange={e => setNewExp(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date (leave empty if current)</Label>
                <Input type="month" value={newExp.endDate} onChange={e => setNewExp(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input placeholder="e.g., San Francisco, CA" value={newExp.location} onChange={e => setNewExp(p => ({ ...p, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea placeholder="Describe your role and responsibilities..." rows={3} value={newExp.description} onChange={e => setNewExp(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddExperience(false)}>Cancel</Button>
              <Button onClick={handleAddExperience}>Add Experience</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Education Dialog */}
      <Dialog open={showAddEducation} onOpenChange={setShowAddEducation}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Education</DialogTitle>
            <DialogDescription>Add a degree or certification</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>School/Institution</Label>
              <Input placeholder="e.g., Stanford University" value={newEdu.institution} onChange={e => setNewEdu(p => ({ ...p, institution: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Degree</Label>
              <Input placeholder="e.g., Bachelor of Science" value={newEdu.degree} onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Field of Study</Label>
              <Input placeholder="e.g., Computer Science" value={newEdu.fieldOfStudy} onChange={e => setNewEdu(p => ({ ...p, fieldOfStudy: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="month" value={newEdu.startDate} onChange={e => setNewEdu(p => ({ ...p, startDate: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label>End Date (leave empty if current)</Label>
                <Input type="month" value={newEdu.endDate} onChange={e => setNewEdu(p => ({ ...p, endDate: e.target.value }))} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>GPA (optional)</Label>
              <Input placeholder="e.g., 3.8" value={newEdu.gpa} onChange={e => setNewEdu(p => ({ ...p, gpa: e.target.value }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddEducation(false)}>Cancel</Button>
              <Button onClick={handleAddEducation}>Add Education</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
