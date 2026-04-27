import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { LoginPage } from '@/sections/LoginPage';
import { JobSeekerDashboard } from '@/sections/JobSeekerDashboard';
import { CompanyDashboard } from '@/sections/CompanyDashboard';
import { Button } from '@/components/ui/button';
import { Briefcase, Building2, User, Sun, Moon } from 'lucide-react';

function useTheme() {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return { theme, toggleTheme };
}

function RoleSwitcher({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const { user, switchRole, logout } = useAuth();
  const [showMenu, setShowMenu] = useState(false);

  if (!user) return null;

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="rounded-full"
        title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </Button>

      <div className="relative">
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => setShowMenu(!showMenu)}
        >
          <User className="w-4 h-4" />
          <span className="capitalize">{user.role.replace('_', ' ')}</span>
        </Button>

        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl bg-card border border-border overflow-hidden animate-fade-in shadow-lg">
            <div className="p-2">
              <p className="text-xs text-muted-foreground px-3 py-2">Switch Role</p>
              <button
                onClick={() => { switchRole('jobseeker'); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  user.role === 'jobseeker' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
                }`}
              >
                <Briefcase className="w-4 h-4" />
                Job Seeker
              </button>
              <button
                onClick={() => { switchRole('company_admin'); setShowMenu(false); }}
                className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                  user.role === 'company_admin' ? 'bg-primary/20 text-primary' : 'hover:bg-muted'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Company Admin
              </button>
            </div>
            <div className="border-t border-border p-2">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AppContent({ theme, toggleTheme }: { theme: 'light' | 'dark'; toggleTheme: () => void }) {
  const { isAuthenticated, user, isNewUser, completeOnboarding } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <>
      <RoleSwitcher theme={theme} toggleTheme={toggleTheme} />
      {user?.role === 'jobseeker'
        ? <JobSeekerDashboard toggleTheme={toggleTheme} theme={theme} />
        : <CompanyDashboard />}
      {user?.role === 'jobseeker' && <AIAssistant />}
      {isNewUser && <OnboardingModal onComplete={completeOnboarding} />}
    </>
  );
}

import { AIAssistant } from '@/sections/AIAssistant';
import { OnboardingModal } from '@/sections/OnboardingModal';
import { useMockDataInternal, MockDataContext } from '@/hooks/useMockData';

function MockDataProvider({ children }: { children: React.ReactNode }) {
  const data = useMockDataInternal();
  return <MockDataContext.Provider value={data}>{children}</MockDataContext.Provider>;
}

function App() {
  const { theme, toggleTheme } = useTheme();

  return (
    <MockDataProvider>
      <AuthProvider>
        <AppContent theme={theme} toggleTheme={toggleTheme} />
      </AuthProvider>
    </MockDataProvider>
  );
}

export default App;
