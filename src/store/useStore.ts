import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  LoanApplication,
  UploadedFile,
  RiskAssessment,
  Explanation,
  ExplanationStep,
  AssessmentRecord,
  ChatMessage,
  CounterOfferOption,
} from '../types';
import type { IncomeAssessment, FeatureContributions } from '../services/apiClient';

interface AppState {
  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;

  // Form draft (auto-save)
  formDraft: Partial<LoanApplication> | null;
  saveFormDraft: (draft: Partial<LoanApplication>) => void;
  clearFormDraft: () => void;

  // File upload - stores raw file for submission
  uploadedFile: UploadedFile | null;
  rawFile: File | null;
  setUploadedFile: (file: UploadedFile | null) => void;
  setRawFile: (file: File | null) => void;
  updateUploadProgress: (progress: number) => void;
  setUploadError: (error: string) => void;
  clearUploadedFile: () => void;

  // CNIC - stored temporarily from StartPage verification
  cnic: string | null;
  setCnic: (cnic: string | null) => void;

  // Current assessment
  currentAssessment: RiskAssessment | null;
  setCurrentAssessment: (assessment: RiskAssessment | null) => void;

  // Income assessment from backend
  incomeAssessment: IncomeAssessment | null;
  setIncomeAssessment: (data: IncomeAssessment | null) => void;

  // Feature contributions from backend
  featureContributions: FeatureContributions | null;
  setFeatureContributions: (data: FeatureContributions | null) => void;

  // Model intercept/base value
  modelIntercept: number | null;
  setModelIntercept: (value: number | null) => void;

  // Transaction analysis text
  transactionAnalysis: string | null;
  setTransactionAnalysis: (text: string | null) => void;

  // Model explanation text
  modelExplanationText: string | null;
  setModelExplanationText: (text: string | null) => void;

  // Liability scorecard from backend
  liabilityScorecard: any | null;
  setLiabilityScorecard: (data: any | null) => void;

  // Explanation streaming
  explanation: Explanation | null;
  initExplanation: (assessmentId: string) => void;
  addExplanationStep: (step: ExplanationStep) => void;
  updateExplanationStep: (stepId: string, content: string) => void;
  completeExplanationStep: (stepId: string) => void;
  setExplanationComplete: () => void;
  clearExplanation: () => void;

  // Assessment history
  assessmentHistory: AssessmentRecord[];
  addToHistory: (record: AssessmentRecord) => void;
  removeFromHistory: (id: string) => void;
  clearHistory: () => void;

  // UI State
  activeView: 'login' | 'start' | 'form' | 'results' | 'history';
  setActiveView: (view: 'login' | 'start' | 'form' | 'results' | 'history') => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  isEligible: boolean;
  setIsEligible: (eligible: boolean) => void;

  // Decision outputs
  decision: string | null;
  commentary: string | null;
  counterOffers: CounterOfferOption[];
  setDecision: (decision: string | null) => void;
  setCommentary: (commentary: string | null) => void;
  setCounterOffers: (offers: CounterOfferOption[]) => void;

  // Chat functionality
  chatMessages: ChatMessage[];
  isChatLoading: boolean;
  addChatMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setLastMessageComplete: () => void;
  setChatLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Sidebar
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),

      // Form draft
      formDraft: null,
      saveFormDraft: (draft) => set({ formDraft: draft }),
      clearFormDraft: () => set({ formDraft: null }),

      // File upload - stores both metadata and raw file
      uploadedFile: null,
      rawFile: null,
      setUploadedFile: (file) => set({ uploadedFile: file }),
      setRawFile: (file) => set({ rawFile: file }),
      updateUploadProgress: (progress) =>
        set((state) => ({
          uploadedFile: state.uploadedFile
            ? { ...state.uploadedFile, uploadProgress: progress }
            : null,
        })),
      setUploadError: (error) =>
        set((state) => ({
          uploadedFile: state.uploadedFile
            ? { ...state.uploadedFile, status: 'error', errorMessage: error }
            : null,
        })),
      clearUploadedFile: () => set({ uploadedFile: null, rawFile: null }),

      // CNIC
      cnic: null,
      setCnic: (cnic) => set({ cnic }),

      // Current assessment
      currentAssessment: null,
      setCurrentAssessment: (assessment) => set({ currentAssessment: assessment }),

      // Income assessment
      incomeAssessment: null,
      setIncomeAssessment: (data) => set({ incomeAssessment: data }),

      // Feature contributions
      featureContributions: null,
      setFeatureContributions: (data) => set({ featureContributions: data }),

      // Model intercept
      modelIntercept: null,
      setModelIntercept: (value) => set({ modelIntercept: value }),

      // Transaction analysis text
      transactionAnalysis: null,
      setTransactionAnalysis: (text) => set({ transactionAnalysis: text }),

      // Model explanation text
      modelExplanationText: null,
      setModelExplanationText: (text) => set({ modelExplanationText: text }),

      // Liability scorecard
      liabilityScorecard: null,
      setLiabilityScorecard: (data) => set({ liabilityScorecard: data }),

      // Explanation streaming
      explanation: null,
      initExplanation: (assessmentId) =>
        set({
          explanation: {
            id: crypto.randomUUID(),
            assessmentId,
            steps: [],
            summary: '',
            isComplete: false,
          },
        }),
      addExplanationStep: (step) =>
        set((state) => ({
          explanation: state.explanation
            ? { ...state.explanation, steps: [...state.explanation.steps, step] }
            : null,
        })),
      updateExplanationStep: (stepId, content) =>
        set((state) => ({
          explanation: state.explanation
            ? {
                ...state.explanation,
                steps: state.explanation.steps.map((s) =>
                  s.id === stepId ? { ...s, content: s.content + content } : s
                ),
              }
            : null,
        })),
      completeExplanationStep: (stepId) =>
        set((state) => ({
          explanation: state.explanation
            ? {
                ...state.explanation,
                steps: state.explanation.steps.map((s) =>
                  s.id === stepId ? { ...s, status: 'complete' } : s
                ),
              }
            : null,
        })),
      setExplanationComplete: () =>
        set((state) => ({
          explanation: state.explanation ? { ...state.explanation, isComplete: true } : null,
        })),
      clearExplanation: () => set({ explanation: null }),

      // Assessment history
      assessmentHistory: [],
      addToHistory: (record) =>
        set((state) => ({
          assessmentHistory: [record, ...state.assessmentHistory].slice(0, 50), // Keep last 50
        })),
      removeFromHistory: (id) =>
        set((state) => ({
          assessmentHistory: state.assessmentHistory.filter((r) => r.id !== id),
        })),
      clearHistory: () => set({ assessmentHistory: [] }),

      // UI State
      activeView: 'login',
      setActiveView: (view) => set({ activeView: view }),
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      error: null,
      setError: (error) => set({ error }),
      isEligible: false,
      setIsEligible: (eligible) => set({ isEligible: eligible }),

      // Decision outputs
      decision: null,
      commentary: null,
      counterOffers: [],
      setDecision: (decision) => set({ decision }),
      setCommentary: (commentary) => set({ commentary }),
      setCounterOffers: (offers) => set({ counterOffers: offers }),

      // Chat functionality
      chatMessages: [],
      isChatLoading: false,
      addChatMessage: (message) =>
        set((state) => ({
          chatMessages: [...state.chatMessages, message],
        })),
      updateLastAssistantMessage: (content) =>
        set((state) => {
          const messages = [...state.chatMessages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              content: lastMessage.content + content,
            };
          }
          return { chatMessages: messages };
        }),
      setLastMessageComplete: () =>
        set((state) => {
          const messages = [...state.chatMessages];
          const lastMessage = messages[messages.length - 1];
          if (lastMessage && lastMessage.role === 'assistant') {
            messages[messages.length - 1] = {
              ...lastMessage,
              isStreaming: false,
            };
          }
          return { chatMessages: messages };
        }),
      setChatLoading: (loading) => set({ isChatLoading: loading }),
      clearChat: () => set({ chatMessages: [] }),
    }),
    {
      name: 'loan-risk-storage',
      partialize: (state) => ({
        formDraft: state.formDraft,
        assessmentHistory: state.assessmentHistory,
        isSidebarOpen: state.isSidebarOpen,
      }),
    }
  )
);
