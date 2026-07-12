# UBL Credit Risk Assessment App

A modern React application for loan risk assessment with ML-powered scoring and LLM-generated explanations.

## Features

- **Loan Application Form**: 15 attributes covering personal info, employment, financial history, and loan details
- **File Upload**: Drag & drop support for CSV/Excel bank statement files
- **Risk Scoring**: ML model integration for credit risk calculation
- **AI Explanations**: LLM-generated explanations of transaction analysis and risk factors
- **Modern UI**: Clean UBL corporate theme

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Zustand** - State management
- **React Hook Form + Zod** - Form validation
- **React Dropzone** - File uploads
- **React Markdown** - Explanation rendering

## Getting Started

### Prerequisites

- Node.js 18+ (Download from https://nodejs.org/)
- npm (comes with Node.js)

### Installation

```bash
# 1. Navigate to the project folder
cd loan-risk-app

# 2. Install dependencies
npm install

# 3. Create environment file (copy from example)
cp .env.example .env
# On Windows PowerShell:
# Copy-Item .env.example .env

# 4. Start development server
npm run dev
```

The app will be available at http://localhost:3000

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:8000` |
| `VITE_MAX_FILE_SIZE` | Max upload size (bytes) | `10485760` (10MB) |
| `VITE_ALLOWED_FILE_TYPES` | Allowed file extensions | `.csv,.xlsx,.xls` |

## Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx       # App header with navigation
│   ├── Sidebar.tsx      # Side navigation & history
│   ├── LoanForm.tsx     # Main application form
│   ├── FileUpload.tsx   # Drag & drop file upload
│   ├── Results.tsx      # Risk score display
│   ├── ThinkingBlock.tsx# Streaming explanation UI
│   └── History.tsx      # Assessment history table
├── services/
│   └── apiClient.ts     # API client with streaming
├── store/
│   └── useStore.ts      # Zustand state management
├── types/
│   └── loan.ts          # TypeScript types & Zod schemas
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles & Tailwind
```

## Backend API Contract

The app expects the following API endpoints:

### POST /api/upload
Upload financial data file.

**Request**: `multipart/form-data` with `file` field

**Response**:
```json
{
  "fileId": "uuid",
  "fileName": "data.csv",
  "processedRows": 150
}
```

### POST /api/score
Submit loan application for risk scoring.

**Request**:
```json
{
  "application": {
    "fullName": "John Doe",
    "age": 35,
    "gender": "male",
    "maritalStatus": "married",
    "employmentStatus": "employed",
    "annualIncome": 75000,
    "monthlyExpenses": 3000,
    "employmentYears": 5,
    "creditScore": 720,
    "existingLoans": 1,
    "totalDebt": 15000,
    "loanAmount": 25000,
    "loanPurpose": "home",
    "loanTerm": 60,
    "homeOwnership": "mortgage"
  },
  "fileId": "optional-uuid"
}
```

**Response**:
```json
{
  "assessmentId": "uuid",
  "riskScore": 35,
  "riskCategory": "low",
  "defaultProbability": 0.08,
  "recommendation": "approve"
}
```

### GET /api/explanations/:assessmentId/stream
Stream LLM explanation via Server-Sent Events.

**Response** (SSE stream):
```
data: {"type": "step_start", "stepId": "1", "stepType": "analysis", "title": "Credit Profile Analysis"}

data: {"type": "step_delta", "stepId": "1", "content": "The applicant has a credit score of 720..."}

data: {"type": "step_complete", "stepId": "1"}

data: {"type": "complete"}
```

## Development

```bash
# Run dev server
npm run dev

# Type check
npx tsc --noEmit

# Build for production
npm run build

# Preview production build
npm run preview
```

## Testing Without Backend

For frontend development without a backend, you can use the mock server:

```bash
# In a separate terminal
node mock-server.js
```

## License

MIT
