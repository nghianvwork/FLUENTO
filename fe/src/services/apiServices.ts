import api from './api';

export const authApi = {
  register: (data: { email: string; password: string; fullName: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
};

export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data: any) => api.put('/user/profile', data),
  getDashboard: () => api.get('/user/dashboard'),
};

export const roleplayApi = {
  getScenarios: (category?: string) =>
    api.get('/roleplay/scenarios', { params: category ? { category } : {} }),
  getScenario: (id: number) => api.get(`/roleplay/scenarios/${id}`),
  startSession: (scenarioId: number) =>
    api.post('/roleplay/sessions/start', { scenarioId }),
  sendMessage: (data: { sessionId?: number; scenarioId?: number; userMessage: string }) =>
    api.post('/roleplay/sessions/message', data),
  completeSession: (id: number) => api.post(`/roleplay/sessions/${id}/complete`),
  getSessions: () => api.get('/roleplay/sessions'),
};

export const careerApi = {
  getPaths: () => api.get('/career/paths'),
  getPath: (id: number) => api.get(`/career/paths/${id}`),
  getLessons: (pathId: number) => api.get(`/career/paths/${pathId}/lessons`),
  getVocabulary: (pathId: number) => api.get(`/career/paths/${pathId}/vocabulary`),
  startLesson: (lessonId: number) => api.post(`/career/lessons/${lessonId}/start`),
  completeLesson: (lessonId: number, score: number) =>
    api.post(`/career/lessons/${lessonId}/complete`, { score }),
  reviewVocab: (vocabId: number, correct: boolean) =>
    api.post(`/career/vocabulary/${vocabId}/review`, { correct }),
  getProgress: () => api.get('/career/progress'),
};

export const accentApi = {
  analyze: (text: string, audioUrl?: string) =>
    api.post('/accent/analyze', { text, audioUrl }),
  getHistory: () => api.get('/accent/history'),
};

export const contentApi = {
  getAll: (topic?: string, type?: string) =>
    api.get('/content', { params: { topic, type } }),
  getById: (id: number) => api.get(`/content/${id}`),
  getProgress: () => api.get('/content/progress'),
  start: (contentId: number) => api.post(`/content/${contentId}/start`),
  complete: (contentId: number) => api.post(`/content/${contentId}/complete`),
  
  // Bookmarks
  getBookmarks: () => api.get('/content/bookmarks'),
  toggleBookmark: (contentId: number) => api.post(`/content/${contentId}/bookmark`),
  getBookmarkStatus: (contentId: number) => api.get(`/content/${contentId}/bookmark-status`),
  
  // Notes
  getNotes: (contentId?: number) => api.get('/content/notes', { params: { contentId } }),
  createNote: (data: { contentId: number; noteText: string; timestampSeconds?: number }) =>
    api.post('/content/notes', data),
  updateNote: (noteId: number, data: { contentId: number; noteText: string; timestampSeconds?: number }) =>
    api.put(`/content/notes/${noteId}`, data),
  deleteNote: (noteId: number) => api.delete(`/content/notes/${noteId}`),
  
  // Vocabulary
  getVocabulary: (contentId?: number) => api.get('/content/vocabulary', { params: { contentId } }),
  saveVocabulary: (data: { contentId: number; word: string; definition?: string; exampleSentence?: string; timestampSeconds?: number }) =>
    api.post('/content/vocabulary', data),
  deleteVocabulary: (vocabId: number) => api.delete(`/content/vocabulary/${vocabId}`),
  
  // Quizzes
  getQuizzes: (contentId: number) => api.get(`/content/${contentId}/quizzes`),
  submitQuizAnswer: (data: { quizId: number; answer: string }) =>
    api.post('/content/quizzes/answer', data),
  
  // Translations
  getTranslations: (contentId: number) => api.get(`/content/${contentId}/translations`),
  getMyTranslations: () => api.get('/content/translations/my'),
  createTranslation: (contentId: number, data: { originalText: string; sourceLanguage: string; targetLanguage: string; timestampSeconds?: number }) =>
    api.post(`/content/${contentId}/translations`, data),
  deleteTranslation: (translationId: number) => api.delete(`/content/translations/${translationId}`),
  
  // Tests
  getTests: (contentId: number) => api.get(`/content/${contentId}/tests`),
  getTest: (testId: number) => api.get(`/content/tests/${testId}`),
  submitTest: (testId: number, data: { answers: Record<number, string>; timeSpent: number }) =>
    api.post(`/content/tests/${testId}/submit`, data),
  getTestAttempts: (testId: number) => api.get(`/content/tests/${testId}/attempts`),
  getMyTestAttempts: () => api.get('/content/tests/attempts/my'),
};

export const speakingApi = {
  getRooms: () => api.get('/speaking/rooms'),
  joinRoom: (roomId: number) => api.post(`/speaking/rooms/${roomId}/join`),
  leaveRoom: (roomId: number) => api.post(`/speaking/rooms/${roomId}/leave`),
};

export const performanceApi = {
  getReports: () => api.get('/performance/reports'),
  generateReport: () => api.post('/performance/reports/generate'),
};

export const publicApi = {
  getScenarioPreview: () => api.get('/public/scenarios/preview'),
  getCareerPreview: () => api.get('/public/careers/preview'),
  getStats: () => api.get('/public/stats'),
};

export const adminApi = {
  getOverview: () => api.get('/admin/overview'),
  getUsers: () => api.get('/admin/users'),
  createUser: (data: { email: string; fullName: string; password?: string; role?: string; status?: string }) =>
    api.post('/admin/users', data),
  updateUser: (id: number, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}`),
  getContent: () => api.get('/admin/content'),
  createContent: (data: any) => api.post('/admin/content', data),
  updateContent: (id: number, data: any) => api.put(`/admin/content/${id}`, data),
  deleteContent: (id: number) => api.delete(`/admin/content/${id}`),
  getScenarios: () => api.get('/admin/roleplay/scenarios'),
  createScenario: (data: any) => api.post('/admin/roleplay/scenarios', data),
  updateScenario: (id: number, data: any) => api.put(`/admin/roleplay/scenarios/${id}`, data),
  deleteScenario: (id: number) => api.delete(`/admin/roleplay/scenarios/${id}`),

  getTests: () => api.get('/admin/tests'),
  createTest: (data: any) => api.post('/admin/tests', data),
  updateTest: (id: number, data: any) => api.put(`/admin/tests/${id}`, data),
  deleteTest: (id: number) => api.delete(`/admin/tests/${id}`),

  getSpeakingRooms: () => api.get('/admin/speaking/rooms'),
  createRoom: (data: any) => api.post('/admin/speaking/rooms', data),
  updateRoom: (id: number, data: any) => api.put(`/admin/speaking/rooms/${id}`, data),
  deleteRoom: (id: number) => api.delete(`/admin/speaking/rooms/${id}`),
  getReports: () => api.get('/admin/reports'),
  getTickets: () => api.get('/admin/moderation/tickets'),
  updateTicket: (id: number, data: any) => api.put(`/admin/moderation/tickets/${id}`, data),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: any) => api.put('/admin/settings', data),
  generateInsights: (data?: { focus?: string }) => api.post('/admin/ai/insights', data || {}),
};

export const aiApi = {
  chat: (data: { message: string; context?: string; tone?: string }) => api.post('/ai/chat', data),
  emotion: (data: { text: string; context?: string }) => api.post('/ai/emotion', data),
};

export const mediaApi = {
  upload: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const communityApi = {
  getClubs: () => api.get('/community/clubs'),
  joinClub: (clubId: number) => api.post(`/community/clubs/${clubId}/join`),
  leaveClub: (clubId: number) => api.post(`/community/clubs/${clubId}/leave`),
  getClubDetail: (clubId: number) => api.get(`/community/clubs/${clubId}`),
  getClubMembers: (clubId: number) => api.get(`/community/clubs/${clubId}/members`),
  getClubPosts: (clubId: number) => api.get(`/community/clubs/${clubId}/posts`),
  createClubPost: (clubId: number, data: { content: string }) =>
    api.post(`/community/clubs/${clubId}/posts`, data),
  addClubComment: (clubId: number, postId: number, data: { content: string }) =>
    api.post(`/community/clubs/${clubId}/posts/${postId}/comments`, data),
  match: () => api.get('/community/match'),
  getEvents: () => api.get('/community/events'),
  reserveEvent: (eventId: number) => api.post(`/community/events/${eventId}/reserve`),
  cancelReservation: (eventId: number) => api.post(`/community/events/${eventId}/cancel`),
};

export const contentAiApi = {
  summary: (data: { contentId: number; focus?: string }) => api.post('/content/ai/summary', data),
};

export const paymentApi = {
  createVnpay: (data: { amount: number; orderInfo?: string; bankCode?: string }) =>
    api.post('/payments/vnpay/create', data),
};

export const achievementApi = {
  getAchievements: () => api.get('/v2/achievements'),
};

export const challengeApi = {
  getChallenges: () => api.get('/v2/challenges'),
  claimReward: (id: number) => api.post(`/v2/challenges/${id}/claim`),
};

export const srsApi = {
  getDueReviews: () => api.get('/v2/srs/due'),
  submitReview: (data: { progressId: number; quality: number }) => api.post('/v2/srs/review', data),
};
