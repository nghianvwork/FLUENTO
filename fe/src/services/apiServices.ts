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
  getRooms: () => api.get('/admin/speaking/rooms'),
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

export const contentAiApi = {
  summary: (data: { contentId: number; focus?: string }) => api.post('/content/ai/summary', data),
};

export const paymentApi = {
  createVnpay: (data: { amount: number; orderInfo?: string; bankCode?: string }) =>
    api.post('/payments/vnpay/create', data),
};
