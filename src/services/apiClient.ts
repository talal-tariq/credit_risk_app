import type {
  LoanApplication,
  ApiResponse,
  UploadResponse,
  ScoreResponse,
  ExplanationStep,
  CounterOfferOption,
} from '../types';

// FastAPI Backend Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 
  'https://credit-loan-drgtd5cwhrh5gjcf.uaenorth-01.azurewebsites.net';

// Monthly salary entry from backend
export interface MonthlySalary {
  date: string;
  salary: number;
}

// Income assessment from backend
export interface IncomeAssessment {
  estimated_salary: number;
  monthly_salaries: MonthlySalary[];
}

// Feature contributions from backend
export interface FeatureContributions {
  AGE: number;
  NODEPEND: number;
  NOCHILD: number;
  CALCINCOME: number;
  DESIREDAMT: number;
  DESIREDTENOR_YEARS: number;
  DEBTBURDEN: number;
  ALLOWEDDEBTBURDEN: number;
  AGGREGATEEXPOSURE: number;
  GENDER: number;
  MSTATUS: number;
  EDLEVEL: number;
  CURRESIDENCETYPE: number;
  CURREMPTYPE: number;
  CURREMPSTATUS: number;
  [key: string]: number; // Allow additional features
}


// Full Credit Analysis Response from backend
export interface FullCreditAnalysisResponse {
  status: string;
  transaction_analysis?: string;
  'transaction-analysis'?: string;
  income_assessment?: IncomeAssessment;
  decision?: string;
  commentary?: string;

  liability_scorecard?: LiabilityScorecard | null;
  counter_offer_options?: {
    offers?: CounterOfferOption[];
  };
  model_explanation?: {
    explanation: string;
    Y?: number; // Model score (legacy)
    original_score: number; // Model score
    intercept?: number; // Model intercept/base value
    original_feature_contributions?: FeatureContributions;
    feature_contributions?: FeatureContributions; // Legacy key
  };
  // Allow additional fields from backend
  [key: string]: unknown;
}

// Liability scorecard entry from backend (new format)
export interface LiabilityScorecardEntry {
  value: string;
  points: number;
}

// Liability scorecard from backend
export interface LiabilityScorecard {
  // Allow flexible key-value pairs for new format (Group-based entries)
  [key: string]: any;
  
  // Total score (new format)
  total_score?: number;
}


export interface CnicEligibilityResponse {
  status: 'success' | 'rejected';
  eligibility: {
    eligible: boolean;
    reason?: string;
    message?: string;
  };
  liability_scorecard: LiabilityScorecard | null;
}

// Helper for fetch with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || errorData.detail || `Request failed with status ${response.status}`,
      };
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error occurred',
    };
  }
}

// Upload financial data file (legacy - kept for backwards compatibility)
export async function uploadFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<UploadResponse>> {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ success: true, data });
        } catch {
          resolve({ success: false, error: 'Invalid response format' });
        }
      } else {
        resolve({ success: false, error: `Upload failed with status ${xhr.status}` });
      }
    });

    xhr.addEventListener('error', () => {
      resolve({ success: false, error: 'Network error during upload' });
    });

    xhr.open('POST', `${API_BASE_URL}/api/upload`);
    xhr.send(formData);
  });
}

// Full Credit Analysis - Submit form data, optional file, and CNIC together
// FastAPI expects: input_features (JSON) + cnic (string) + optional file
export async function submitFullCreditAnalysis(
  application: LoanApplication,
  file?: File | null,
  cnic?: string | null,
  onProgress?: (progress: number) => void
): Promise<ApiResponse<FullCreditAnalysisResponse>> {
  // Build input_features in the exact order expected by the backend
  // Ensure all values are properly converted to primitives (no Timestamp objects)
  const inputFeatures = {
    AGE: Number(application.AGE),
    NODEPEND: Number(application.NODEPEND),
    NOCHILD: Number(application.NOCHILD),
    CALCINCOME: Number(application.CALCINCOME),
    DESIREDAMT: Number(application.DESIREDAMT),
    DESIREDTENOR_YEARS: Number(application.DESIREDTENOR_YEARS),
    DEBTBURDEN: Number(application.DEBTBURDEN),
    ALLOWEDDEBTBURDEN: Number(application.ALLOWEDDEBTBURDEN),
    AGGREGATEEXPOSURE: Number(application.AGGREGATEEXPOSURE),
    ETB_NTB: String(application.ETB_NTB),
    ORIGINCITY: String(application.ORIGINCITY),
    MEDIAN_BALANCE: String(application.MEDIAN_BALANCE),
    ECIB_MONTHS_DIFF: String(application.ECIB_MONTHS_DIFF),
    GENDER: String(application.GENDER),
    MSTATUS: String(application.MSTATUS),
    EDLEVEL: String(application.EDLEVEL),
    CURRESIDENCETYPE: String(application.CURRESIDENCETYPE),
    CURREMPTYPE: String(application.CURREMPTYPE),
    CURREMPSTATUS: String(application.CURREMPSTATUS),
  };

  console.log('[submitFullCreditAnalysis] Cleaned inputFeatures:', inputFeatures);

  if (!file) {
    return {
      success: false,
      error: 'Financial data file is required for full credit analysis.',
    };
  }

  const formData = new FormData();

  // FastAPI expects input_features as a JSON string for multipart requests
  try {
    const jsonString = JSON.stringify(inputFeatures);
    console.log('[submitFullCreditAnalysis] JSON string created successfully', jsonString);
    formData.append('input_features', jsonString);
  } catch (error) {
    console.error('[submitFullCreditAnalysis] JSON stringify failed:', error);
    return {
      success: false,
      error: `Failed to serialize form data: ${error instanceof Error ? error.message : 'Unknown error'}`,
    };
  }

  if (cnic) {
    formData.append('cnic', cnic);
  }

  // Append file if provided - matching FastAPI UploadFile
  formData.append('file', file, file.name);

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const progress = Math.round((event.loaded / event.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          resolve({ success: true, data });
        } catch {
          resolve({ success: false, error: 'Invalid response format' });
        }
      } else {
        try {
          const errorData = JSON.parse(xhr.responseText);
          // FastAPI returns validation errors in detail array
          let errorMessage = '';
          if (Array.isArray(errorData.detail)) {
            errorMessage = errorData.detail.map((err: { loc?: string[]; msg?: string }) =>
              `${err.loc?.join('.')}: ${err.msg}`
            ).join(', ');
          } else {
            errorMessage = errorData.detail || errorData.message || `Request failed with status ${xhr.status}`;
          }
          resolve({ success: false, error: errorMessage });
        } catch {
          resolve({ success: false, error: `Request failed with status ${xhr.status}` });
        }
      }
    });

    xhr.addEventListener('error', () => {
      resolve({ success: false, error: 'Network error occurred' });
    });

    xhr.open('POST', `${API_BASE_URL}/full-credit-analysis`);
    xhr.send(formData);
  });
}

// Submit loan application for scoring (legacy)
export async function submitApplication(
  application: LoanApplication,
  fileId?: string
): Promise<ApiResponse<ScoreResponse>> {
  return fetchApi<ScoreResponse>('/api/score', {
    method: 'POST',
    body: JSON.stringify({ application, fileId }),
  });
}

export async function checkCnic(cnic: string): Promise<ApiResponse<CnicEligibilityResponse>> {
  return fetchApi<CnicEligibilityResponse>('/check-cnic', {
    method: 'POST',
    body: JSON.stringify({ cnic }),
  });
}

// Stream explanation from LLM
export async function streamExplanation(
  assessmentId: string,
  callbacks: {
    onStepStart: (step: ExplanationStep) => void;
    onStepUpdate: (stepId: string, content: string) => void;
    onStepComplete: (stepId: string) => void;
    onComplete: () => void;
    onError: (error: string) => void;
  }
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/explanations/${assessmentId}/stream`, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to start explanation stream: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(line.slice(6));

          switch (data.type) {
            case 'step_start':
              callbacks.onStepStart({
                id: data.stepId,
                type: data.stepType,
                title: data.title,
                content: '',
                status: 'streaming',
              });
              break;

            case 'step_delta':
              callbacks.onStepUpdate(data.stepId, data.content);
              break;

            case 'step_complete':
              callbacks.onStepComplete(data.stepId);
              break;

            case 'complete':
              callbacks.onComplete();
              return;

            case 'error':
              callbacks.onError(data.message);
              return;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    callbacks.onComplete();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : 'Stream error');
  }
}

// Get assessment history
export async function getAssessmentHistory(): Promise<ApiResponse<{ records: ScoreResponse[] }>> {
  return fetchApi('/api/assessments');
}

// Get single assessment details
export async function getAssessment(id: string): Promise<ApiResponse<ScoreResponse>> {
  return fetchApi(`/api/assessments/${id}`);
}

// Stream chat response for follow-up questions
export async function streamChatResponse(
  assessmentId: string,
  message: string,
  history: { role: 'user' | 'assistant'; content: string }[],
  callbacks: {
    onDelta: (content: string) => void;
    onComplete: () => void;
    onError: (error: string) => void;
  }
): Promise<void> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
      },
      body: JSON.stringify({
        assessmentId,
        message,
        history,
      }),
    });

    if (!response.ok) {
      throw new Error(`Chat request failed: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No response body');
    }

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;

        try {
          const data = JSON.parse(line.slice(6));

          switch (data.type) {
            case 'delta':
              callbacks.onDelta(data.content);
              break;

            case 'complete':
              callbacks.onComplete();
              return;

            case 'error':
              callbacks.onError(data.message);
              return;
          }
        } catch {
          // Skip malformed JSON lines
        }
      }
    }

    callbacks.onComplete();
  } catch (error) {
    callbacks.onError(error instanceof Error ? error.message : 'Chat error');
  }
}
