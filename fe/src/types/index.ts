export interface User {
  id: number;
  email: string;
  fullName: string;
  role: string;
  status: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface UserProfile {
  id: number;
  displayName: string;
  nativeLanguage: string;
  cefrLevel: string;
  targetLevel: string;
  dailyGoalMinutes: number;
  preferredAccent: string;
  careerIndustry: string;
  careerGoal: string;
  streakCount: number;
  totalXp: number;
  totalLessonsCompleted: number;
  totalRoleplayMinutes: number;
  totalWordsLearned: number;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  email: string;
  fullName: string;
  role: string;
  userId: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface DashboardData {
  streakCount: number;
  totalXp: number;
  wordsLearned: number;
  lessonsCompleted: number;
  roleplayMinutes: number;
  cefrLevel: string;
  dailyGoalMinutes: number;
  todayMinutes: number;
  todayProgress: number;
}

export interface Scenario {
  id: number;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  aiPersonality: string;
  contextPrompt: string;
  tags: string;
}

export interface RoleplaySession {
  id: number;
  scenarioId: number;
  conversationJson: string;
  feedbackSummary: string;
  durationSeconds: number;
  score: number;
  status: string;
  createdAt: string;
}

export interface CareerPath {
  id: number;
  name: string;
  description: string;
  icon: string;
  estimatedWeeks: number;
  vocabularyCount: number;
}

export interface Vocabulary {
  id: number;
  word: string;
  definition: string;
  pronunciationIpa: string;
  exampleSentences: string;
  difficulty: string;
  frequencyRank: number;
}

export interface Lesson {
  id: number;
  title: string;
  lessonType: string;
  contentJson: string;
  orderIndex: number;
  estimatedMinutes: number;
}

export interface PronunciationRecord {
  id: number;
  textPrompt: string;
  accuracyScore: number;
  intonationScore: number;
  rhythmScore: number;
  stressScore: number;
  speedWpm: number;
  aiFeedback: string;
  createdAt: string;
}

export interface ContentItem {
  id: number;
  title: string;
  sourceUrl: string;
  sourceType: string;
  thumbnailUrl: string;
  durationSeconds: number;
  difficulty: string;
  topic: string;
  summary: string;
  tags: string;
}

export interface SpeakingRoom {
  id: number;
  title: string;
  topic: string;
  maxParticipants: number;
  difficultyLevel: string;
  roomType: string;
  status: string;
  currentParticipants: number;
}

export interface PerformanceReport {
  id: number;
  reportPeriodStart: string;
  reportPeriodEnd: string;
  overallScore: number;
  grammarAnalysisJson: string;
  vocabularyAnalysisJson: string;
  pronunciationAnalysisJson: string;
  strengthMapJson: string;
  errorPatternsJson: string;
  peerBenchmarkJson: string;
  cefrEstimate: string;
  recommendationsJson: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: Date;
  errors?: string[];
  tips?: string[];
}

export interface AdminOverview {
  activeUsers: number;
  newUsers: number;
  retentionRate: number;
  mrr: number;
  flaggedItems: number;
  pendingApprovals: number;
  uptimePercent: number;
  apiP95Ms: number;
  aiCostToday: number;
  processingQueue: number;
}

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  plan: string;
  lastActive: string;
  totalXp: number;
}

export interface AdminContentItem {
  id: number;
  title: string;
  type: string;
  topic: string;
  difficulty: string;
  status: string;
  owner: string;
  updatedAt: string;
}

export interface AdminScenarioOverview {
  id: number;
  title: string;
  category: string;
  difficulty: string;
  status: string;
  usageCount: number;
  rating: number;
}

export interface AdminRoomOverview {
  id: number;
  title: string;
  topic: string;
  status: string;
  host: string;
  participants: number;
  capacity: number;
}

export interface AdminReportItem {
  id: number;
  title: string;
  period: string;
  status: string;
  generatedAt: string;
}

export interface AdminTicket {
  id: number;
  type: string;
  priority: string;
  subject: string;
  status: string;
  reporter: string;
  createdAt: string;
}
