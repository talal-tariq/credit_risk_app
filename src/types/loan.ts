import { z } from 'zod';

// Loan applicant attributes schema - matches ML model features
export const loanApplicationSchema = z.object({
  // Numerical Features
  AGE: z.number().min(18, 'Must be at least 18 years old').max(100, 'Invalid age'),
  NODEPEND: z.number().min(0, 'Number of dependents must be 0 or more'),
  NOCHILD: z.number().min(0, 'Number of children must be 0 or more'),
  CALCINCOME: z.number().min(0, 'Income must be positive'),
  DESIREDAMT: z.number().min(1000, 'Loan amount must be at least 1,000'),
  DESIREDTENOR_YEARS: z.number().min(1, 'Loan term must be at least 1 year').max(30, 'Loan term cannot exceed 30 years'),
  DEBTBURDEN: z.number().min(0, 'Debt burden must be 0 or more').max(100, 'Debt burden cannot exceed 100%'),
  ALLOWEDDEBTBURDEN: z.number().min(0, 'Allowed debt burden must be 0 or more').max(100, 'Cannot exceed 100%'),
  AGGREGATEEXPOSURE: z.number().min(0, 'Aggregate exposure must be 0 or more'),
  ETB_NTB: z.enum(['NTB', 'ETB'], { required_error: 'ETB/NTB is required' }),
  ORIGINCITY: z.enum([
    'Peshawar',
    'Multan',
    'Karachi',
    'Hyderabad',
    'Sukkar',
    'Rawalpindi/Islamabad',
    'Faisalabad',
    'Taxila',
    'Others',
    'Lahore',
    'Sargodha',
  ], { required_error: 'Origin city is required' }),
  MEDIAN_BALANCE: z.enum(['Not_Available', '0-1K', '1K-5K', '5K-15K', '>15K'], { required_error: 'Median balance is required' }),
  ECIB_MONTHS_DIFF: z.enum(['New_To_Industry', 'Existing_To_Industry'], { required_error: 'ECIB months diff is required' }),

  // Categorical Features
  GENDER: z.enum(['F', 'M'], { required_error: 'Gender is required' }),
  
  MSTATUS: z.enum(['D', 'M', 'S', 'W'], { required_error: 'Marital status is required' }),
  
  EDLEVEL: z.enum([
    'Bachelor degree',
    'High Schooling Gradute',
    'Intermediate',
    'Master Degree',
    'Matriculation',
    'Missing',
    'P.hd'
  ], { required_error: 'Education level is required' }),
  
  CURRESIDENCETYPE: z.enum([
    'Company Provided',
    'Mortgaged',
    'Others',
    'Own',
    'Rented',
    'Wife / Husband House',
    'With Parents'
  ], { required_error: 'Residence type is required' }),
  
  CURREMPTYPE: z.enum([
    'ARF',
    'DVST',
    'GOV',
    'GOVN',
    'LMS',
    'PACC',
    'PTMN',
    'SALCE',
    'SALP',
    'SEB',
    'UBLP'
  ], { required_error: 'Employment type is required' }),
  
  CURREMPSTATUS: z.enum([
    'BUSS',
    'COMM',
    'CONT',
    'OTHR',
    'OUTSOURC',
    'PRMT'
  ], { required_error: 'Employment status is required' }),
});

export type LoanApplication = z.infer<typeof loanApplicationSchema>;

// Display labels for categorical fields
export const categoryLabels = {
  GENDER: {
    F: 'Female',
    M: 'Male',
  },
  MSTATUS: {
    D: 'Divorced',
    M: 'Married',
    S: 'Single',
    W: 'Widowed',
  },
  EDLEVEL: {
    'High Schooling Gradute': 'High School Graduate',
    'Matriculation': 'Matriculation',
    'Intermediate': 'Intermediate',
    'Bachelor degree': 'Bachelor Degree',
    'Master Degree': 'Master Degree',
    'P.hd': 'PhD',
    'Missing': 'Not Specified',

  },
  CURRESIDENCETYPE: {
    'Own': 'Own House',
    'With Parents': 'With Parents',
    'Wife / Husband House': 'Spouse\'s House',
    'Company Provided': 'Company Provided',
    'Mortgaged': 'Mortgaged',
    'Rented': 'Rented',
    'Others': 'Others',

  },
  CURREMPTYPE: {
    ARF: 'ARF',
    GOV: 'GOV',
    GOVN: 'GOVN',
    LMS: 'LMS',
    PACC: 'PACC',
    PTMN: 'PTMN',
    SALCE: 'SALCE',
    SALP: 'SALP',
    SEB: 'SEB',
    UBLP: 'UBLP',
    DVST: 'DVST',

  },
  CURREMPSTATUS: {
    BUSS: 'Business Owner',
    COMM: 'Commission Based',
    CONT: 'Contractual',
    OTHR: 'Other',
    OUTSOURC: 'Outsourced',
    PRMT: 'Permanent',
  },
};

// File upload types
export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadProgress: number;
  status: 'uploading' | 'completed' | 'error';
  errorMessage?: string;
}

export interface CounterOfferOption {
  DESIREDAMT: number;
  DESIREDTENOR_YEARS: number;
  original_score?: number;
  Y_score?: number;
}

// Risk assessment result
export interface RiskAssessment {
  id: string;
  applicationId: string;
  riskScore: number; // 0-100, higher = more risky
  riskCategory: 'low' | 'medium' | 'high';
  defaultProbability: number; // 0-1
  recommendation: 'approve' | 'review' | 'reject';
  factors: RiskFactor[];
  createdAt: string;
}

export interface RiskFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// Streaming explanation types (similar to thinking steps in Claude UI)
export interface ExplanationStep {
  id: string;
  type: 'analysis' | 'factor' | 'recommendation' | 'summary';
  title: string;
  content: string;
  status: 'pending' | 'streaming' | 'complete';
}

export interface Explanation {
  id: string;
  assessmentId: string;
  steps: ExplanationStep[];
  summary: string;
  isComplete: boolean;
}

// Application history
export interface AssessmentRecord {
  id: string;
  applicantName: string;
  loanAmount: number;
  riskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  recommendation: 'approve' | 'review' | 'reject';
  createdAt: string;
}

// Chat messages for follow-up questions
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isStreaming?: boolean;
}

export interface ChatSession {
  assessmentId: string;
  messages: ChatMessage[];
}

// Form state
export interface FormState {
  currentStep: number;
  totalSteps: number;
  isSubmitting: boolean;
  isDirty: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadResponse {
  fileId: string;
  fileName: string;
  processedRows: number;
}

export interface ScoreRequest {
  application: LoanApplication;
  fileId?: string;
}

export interface ScoreResponse {
  assessmentId: string;
  riskScore: number;
  riskCategory: 'low' | 'medium' | 'high';
  defaultProbability: number;
  recommendation: 'approve' | 'review' | 'reject';
}
