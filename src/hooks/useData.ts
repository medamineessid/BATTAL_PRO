import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';
import type { Job, Application, Badge, Quiz, QuizAttempt, JobSeekerProfile, JobMatch } from '@/types';

export function useData() {
  const { user, isAuthenticated } = useAuth();
  const [profile, setProfile] = useState<JobSeekerProfile | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [swipedJobs, setSwipedJobs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - replace with actual API calls
  const fetchProfile = useCallback(async () => {}, [user]);
  const fetchJobs = useCallback(async () => {}, []);
  const fetchApplications = useCallback(async () => {}, [user]);
  const fetchBadges = useCallback(async () => {}, [user]);
  const fetchQuizzes = useCallback(async () => {}, []);
  const fetchQuizAttempts = useCallback(async () => {}, [user]);
  const fetchSwipedJobs = useCallback(async () => {}, [user]);
  const applyToJob = useCallback(async (jobId: string, coverLetter?: string) => ({ error: null }), [user]);
  const swipeJob = useCallback(async (jobId: string, liked: boolean) => ({ error: null }), [user]);
  const completeQuiz = useCallback(async (quizId: string, answers: Record<string, string | string[]>, score: number, percentage: number) => ({ error: null }), [user]);
  const updateProfile = useCallback(async (updates: Partial<JobSeekerProfile>) => ({ error: null }), [user]);
  const getJobMatches = useCallback((): JobMatch[] => [], [jobs, profile]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  return {
    profile,
    jobs,
    applications,
    badges,
    quizzes,
    quizAttempts,
    swipedJobs,
    notifications,
    isLoading,
    getJobMatches,
    applyToJob,
    swipeJob,
    completeQuiz,
    updateProfile,
    refresh: {
      profile: fetchProfile,
      jobs: fetchJobs,
      applications: fetchApplications,
      badges: fetchBadges,
      quizzes: fetchQuizzes,
      quizAttempts: fetchQuizAttempts,
      swipedJobs: fetchSwipedJobs,
    },
  };
}
