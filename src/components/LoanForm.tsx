
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';

import { useStore } from '../store/useStore';
import { loanApplicationSchema, categoryLabels, type LoanApplication } from '../types';
import { FileUpload } from './FileUpload';
import { LiabilityScoreCard } from './LiabilityScoreCard';
import { submitFullCreditAnalysis } from '../services/apiClient';

type RiskCategory = 'low' | 'medium' | 'high';
type Recommendation = 'approve' | 'review' | 'reject';

const START_VIEW = 'start'; // <-- change to your StartPage view key if different
const RESULTS_VIEW = 'results';

const DEFAULT_VALUES: LoanApplication = {
  AGE: 42,
  NODEPEND: 2,
  NOCHILD: 0,
  CALCINCOME: 87000,
  DESIREDAMT: 150000,
  DESIREDTENOR_YEARS: 2,
  DEBTBURDEN: 22.34,
  ALLOWEDDEBTBURDEN: 40,
  AGGREGATEEXPOSURE: 330000,
  ETB_NTB: 'NTB' as any,
  ORIGINCITY: 'Others' as any,
  MEDIAN_BALANCE: 'Not_Available' as any,
  ECIB_MONTHS_DIFF: 'New_To_Industry' as any,
  GENDER: '' as any,
  MSTATUS: '' as any,
  EDLEVEL: '' as any,
  CURRESIDENCETYPE: '' as any,
  CURREMPTYPE: '' as any,
  CURREMPSTATUS: '' as any,
};

// ---- helpers (kept inside file for simplicity) ----
function getRiskDecisionFromScore(score: number): {
  riskCategory: RiskCategory;
  recommendation: Recommendation;
} {
  // High Risk: below 0.50, Medium: 0.50–0.70, Low: 0.70+
  if (score < 0.5) return { riskCategory: 'high', recommendation: 'reject' };
  if (score >= 0.7) return { riskCategory: 'low', recommendation: 'approve' };
  return { riskCategory: 'medium', recommendation: 'review' };
}

function extractModelFields(responseData: any) {
  const modelExplanationObj = responseData?.model_explanation;
  const cashPlusCard = responseData?.cashplus_card;

  console.log('Cash Plus Card:', cashPlusCard);
  console.log('Model Explanation:', modelExplanationObj);

  const riskScore =
    modelExplanationObj?.Y ??
    modelExplanationObj?.original_score ??
    0;

  const explanationText =
    modelExplanationObj?.explanation ??
    modelExplanationObj?.original_explanation ??
    responseData?.model_explanation_text ??
    '';

  const featureContribs =
    cashPlusCard ??
    modelExplanationObj?.original_feature_contributions ??
    modelExplanationObj?.feature_contributions ??
    null;

  console.log('Feature Contributions being used:', featureContribs);

  const intercept = modelExplanationObj?.intercept ?? null;

  const transactionText =
    responseData?.transaction_analysis ??
    responseData?.['transaction-analysis'] ??
    '';

  const counterOfferOptions =
    modelExplanationObj?.counter_offer_options ??
    responseData?.counter_offer_options ??
    null;

  const decision =
    modelExplanationObj?.decision ??
    responseData?.decision ??
    null;

  const commentary =
    counterOfferOptions?.commentary ??
    modelExplanationObj?.commentary ??
    responseData?.commentary ??
    null;

  const counterOffers = counterOfferOptions?.offers ?? [];

  const incomeData = responseData?.income_assessment ?? null;

  const liability = responseData.liability_scorecard ?? null;

  return {
    riskScore,
    explanationText,
    featureContribs,
    intercept,
    transactionText,
    counterOfferOptions,
    decision,
    commentary,
    counterOffers,
    incomeData,
    liability,
  };
}

function buildAssessment(assessmentId: string, riskScore: number) {
  const { riskCategory, recommendation } = getRiskDecisionFromScore(riskScore);

  return {
    id: assessmentId,
    applicationId: assessmentId,
    riskScore,
    riskCategory,
    defaultProbability: riskScore,
    recommendation,
    factors: [],
    createdAt: new Date().toISOString(),
  };
}

export function LoanForm() {
  const {
    formDraft,
    saveFormDraft,
    clearFormDraft,
    rawFile,
    clearUploadedFile,
    cnic,
    setCnic,

    setCurrentAssessment,
    setIncomeAssessment,
    setLiabilityScorecard,
    setFeatureContributions,
    setModelIntercept,
    setTransactionAnalysis,
    setModelExplanationText,

    initExplanation,
    addExplanationStep,
    setExplanationComplete,
    addToHistory,

    setActiveView,
    isLoading,
    setIsLoading,
    setError,
    clearChat,
    isEligible,
    setIsEligible,

    setDecision,
    setCommentary,
    setCounterOffers,
    
    liabilityScorecard,
  } = useStore();

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<LoanApplication>({
    resolver: zodResolver(loanApplicationSchema),
    defaultValues: formDraft || DEFAULT_VALUES,
  });

  // Auto-save draft
  const formValues = watch();
  useEffect(() => {
    if (!isDirty) return;

    const timeout = setTimeout(() => {
      saveFormDraft(formValues);
    }, 1000);

    return () => clearTimeout(timeout);
  }, [formValues, isDirty, saveFormDraft]);

  const inputClass = (hasError: boolean) =>
    clsx('input-field', hasError && 'input-error');

  const handleNewAssessment = () => {
    if (isLoading) return;

    setError(null);
    clearChat();

    // clear results-related state
    setDecision(null);
    setCommentary(null);
    setCounterOffers([]);

    // Clear assessment outputs (if your store setters don't accept null, replace these with store reset actions)
    setCurrentAssessment(null as any);
    setIncomeAssessment(null as any);
    setLiabilityScorecard(null as any);
    setFeatureContributions(null as any);
    setModelIntercept(null as any);
    setTransactionAnalysis('');
    setModelExplanationText('');

    // Clear draft + file and reset form
    clearFormDraft();
    clearUploadedFile();
    setCnic(null);
    reset(DEFAULT_VALUES);

    // Force CNIC screening again
    setIsEligible(false);

    // Navigate to StartPage
    setActiveView(START_VIEW);
  };

  const onSubmit = async (data: LoanApplication) => {
    setIsLoading(true);
    setError(null);
    clearChat();

    setDecision(null);
    setCommentary(null);
    setCounterOffers([]);

    try {
      console.log('[LoanForm] Raw form data:', data);
      console.log('[LoanForm] Data keys:', Object.keys(data));
      
      // Clean the data to only include expected fields (remove any Timestamp or extra fields)
      const cleanedData: LoanApplication = {
        AGE: data.AGE,
        NODEPEND: data.NODEPEND,
        NOCHILD: data.NOCHILD,
        CALCINCOME: data.CALCINCOME,
        DESIREDAMT: data.DESIREDAMT,
        DESIREDTENOR_YEARS: data.DESIREDTENOR_YEARS,
        DEBTBURDEN: data.DEBTBURDEN,
        ALLOWEDDEBTBURDEN: data.ALLOWEDDEBTBURDEN,
        AGGREGATEEXPOSURE: data.AGGREGATEEXPOSURE,
        ETB_NTB: data.ETB_NTB,
        ORIGINCITY: data.ORIGINCITY,
        MEDIAN_BALANCE: data.MEDIAN_BALANCE,
        ECIB_MONTHS_DIFF: data.ECIB_MONTHS_DIFF,
        GENDER: data.GENDER,
        MSTATUS: data.MSTATUS,
        EDLEVEL: data.EDLEVEL,
        CURRESIDENCETYPE: data.CURRESIDENCETYPE,
        CURREMPTYPE: data.CURREMPTYPE,
        CURREMPSTATUS: data.CURREMPSTATUS,
      };
      
      console.log('[LoanForm] Cleaned data:', cleanedData);

      const result = await submitFullCreditAnalysis(cleanedData, rawFile, cnic);

      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to submit application');
      }

      const responseData = result.data;
      console.log('Backend Response:', responseData);

      const assessmentId = crypto.randomUUID();

      const {
        riskScore,
        explanationText,
        featureContribs,
        intercept,
        transactionText,
        decision,
        commentary,
        counterOffers,
        incomeData,
        liability,
      } = extractModelFields(responseData);

      const assessment = buildAssessment(assessmentId, riskScore);

      // Store main assessment
      setCurrentAssessment(assessment);

      // Store additional data
      setIncomeAssessment(incomeData);
      setLiabilityScorecard(liability);

      setFeatureContributions(featureContribs);
      setModelIntercept(intercept);
      setTransactionAnalysis(transactionText);
      setModelExplanationText(explanationText);
      setDecision(decision);
      setCommentary(commentary);
      setCounterOffers(counterOffers);

      // Add to history
      addToHistory({
        id: assessment.id,
        applicantName: `${categoryLabels.GENDER[data.GENDER]} - Age ${data.AGE}`,
        loanAmount: data.DESIREDAMT,
        riskScore: assessment.riskScore,
        riskCategory: assessment.riskCategory,
        recommendation: assessment.recommendation,
        createdAt: assessment.createdAt,
      });

      // Explanation steps
      initExplanation(assessment.id);

      if (transactionText) {
        addExplanationStep({
          id: 'transaction-analysis',
          type: 'analysis',
          title: 'Transaction Analysis',
          content: transactionText,
          status: 'complete',
        });
      }

      if (explanationText) {
        addExplanationStep({
          id: 'model-explanation',
          type: 'summary',
          title: 'Credit Risk Assessment',
          content: explanationText,
          status: 'complete',
        });
      }

      setExplanationComplete();

      // Clear form/file and redirect to results
      clearFormDraft();
      clearUploadedFile();
      reset(DEFAULT_VALUES);
      setActiveView(RESULTS_VIEW);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-6xl mx-auto p-6 space-y-8">
      {/* Top header row */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Loan Application</h1>


      <button
        type="button"
        onClick={handleNewAssessment}
        disabled={isLoading}
        className="
          inline-flex items-center gap-2
          rounded-lg bg-[#0b5a78] px-6 py-3
          text-base font-semibold text-white
          shadow-sm transition
          hover:bg-[#094e68]
          focus:outline-none focus:ring-4 focus:ring-[#0b5a78]/25
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        <span className="text-xl leading-none">+</span>
        New Assessment
      </button>

      </div>

      {isEligible && (
        <div className="card border border-green-200 bg-green-50 animate-fade-in">
          <div className="flex items-center gap-3 px-4 py-3 text-green-700">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-600 text-white">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </span>
            <span className="text-sm font-medium">
              Customer has passed the <b>PEP</b> and <b>NEGATIVE</b> lists.
            </span>
          </div>
        </div>
      )}

      {/* Main layout: Form on left, Scorecard on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Form (2 columns wide) */}
        <div className="lg:col-span-2 space-y-6">
        
      {/* Personal Information */}
      <section className="card animate-fade-in">
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          Personal Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="label">Age *</label>
            <input
              type="number"
              {...register('AGE', { valueAsNumber: true })}
              className={inputClass(!!errors.AGE)}
              placeholder="30"
            />
            {errors.AGE && <p className="error-text">{errors.AGE.message}</p>}
          </div>

          <div>
            <label className="label">Gender *</label>
            <Controller
              name="GENDER"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.GENDER)}>
                  <option value="">Select gender</option>
                  {Object.entries(categoryLabels.GENDER).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.GENDER && <p className="error-text">{errors.GENDER.message}</p>}
          </div>

          <div>
            <label className="label">Marital Status *</label>
            <Controller
              name="MSTATUS"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.MSTATUS)}>
                  <option value="">Select status</option>
                  {Object.entries(categoryLabels.MSTATUS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.MSTATUS && <p className="error-text">{errors.MSTATUS.message}</p>}
          </div>

          <div>
            <label className="label">Number of Dependents *</label>
            <input
              type="number"
              {...register('NODEPEND', { valueAsNumber: true })}
              className={inputClass(!!errors.NODEPEND)}
              placeholder="0"
              min={0}
            />
            {errors.NODEPEND && <p className="error-text">{errors.NODEPEND.message}</p>}
          </div>

          <div>
            <label className="label">Number of Children *</label>
            <input
              type="number"
              {...register('NOCHILD', { valueAsNumber: true })}
              className={inputClass(!!errors.NOCHILD)}
              placeholder="0"
              min={0}
            />
            {errors.NOCHILD && <p className="error-text">{errors.NOCHILD.message}</p>}
          </div>

          <div>
            <label className="label">Education Level *</label>
            <Controller
              name="EDLEVEL"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.EDLEVEL)}>
                  <option value="">Select education</option>
                  {Object.entries(categoryLabels.EDLEVEL).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.EDLEVEL && <p className="error-text">{errors.EDLEVEL.message}</p>}
          </div>
        </div>
      </section>

      {/* Residence Information */}
      <section className="card animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
          Residence Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Residence Type *</label>
            <Controller
              name="CURRESIDENCETYPE"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.CURRESIDENCETYPE)}>
                  <option value="">Select residence type</option>
                  {Object.entries(categoryLabels.CURRESIDENCETYPE).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.CURRESIDENCETYPE && (
              <p className="error-text">{errors.CURRESIDENCETYPE.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Employment Information */}
      <section className="card animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
          Employment Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Employment Type *</label>
            <Controller
              name="CURREMPTYPE"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.CURREMPTYPE)}>
                  <option value="">Select employment type</option>
                  {Object.entries(categoryLabels.CURREMPTYPE).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.CURREMPTYPE && <p className="error-text">{errors.CURREMPTYPE.message}</p>}
          </div>

          <div>
            <label className="label">Employment Status *</label>
            <Controller
              name="CURREMPSTATUS"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.CURREMPSTATUS)}>
                  <option value="">Select employment status</option>
                  {Object.entries(categoryLabels.CURREMPSTATUS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            />
            {errors.CURREMPSTATUS && (
              <p className="error-text">{errors.CURREMPSTATUS.message}</p>
            )}
          </div>

          <div>
            <label className="label">Calculated Income *</label>
            <input
              type="number"
              step="0.0001"
              {...register('CALCINCOME', { valueAsNumber: true })}
              className={inputClass(!!errors.CALCINCOME)}
              placeholder="50000"
            />
            {errors.CALCINCOME && <p className="error-text">{errors.CALCINCOME.message}</p>}
          </div>
        </div>
      </section>

      {/* Financial Information */}
      <section className="card animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Financial Information
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="label">Debt Burden (%) *</label>
            <input
              type="number"
              step="0.0001"
              {...register('DEBTBURDEN', { valueAsNumber: true })}
              className={inputClass(!!errors.DEBTBURDEN)}
              placeholder="30"
              min={0}
              max={100}
            />
            {errors.DEBTBURDEN && <p className="error-text">{errors.DEBTBURDEN.message}</p>}
          </div>

          <div>
            <label className="label">Allowed Debt Burden (%) *</label>
            <input
              type="number"
              step="0.0001"
              {...register('ALLOWEDDEBTBURDEN', { valueAsNumber: true })}
              className={inputClass(!!errors.ALLOWEDDEBTBURDEN)}
              placeholder="50"
              min={0}
              max={100}
            />
            {errors.ALLOWEDDEBTBURDEN && (
              <p className="error-text">{errors.ALLOWEDDEBTBURDEN.message}</p>
            )}
          </div>

          <div>
            <label className="label">Aggregate Exposure *</label>
            <input
              type="number"
              step="0.0001"
              {...register('AGGREGATEEXPOSURE', { valueAsNumber: true })}
              className={inputClass(!!errors.AGGREGATEEXPOSURE)}
              placeholder="0"
              min={0}
            />
            {errors.AGGREGATEEXPOSURE && (
              <p className="error-text">{errors.AGGREGATEEXPOSURE.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Loan Details */}
      <section className="card animate-fade-in" style={{ animationDelay: '0.4s' }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Loan Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">Desired Loan Amount *</label>
            <input
              type="number"
              step="0.0001"
              {...register('DESIREDAMT', { valueAsNumber: true })}
              className={inputClass(!!errors.DESIREDAMT)}
              placeholder="100000"
            />
            {errors.DESIREDAMT && <p className="error-text">{errors.DESIREDAMT.message}</p>}
          </div>

          <div>
            <label className="label">Loan Tenor (Years) *</label>
            <input
              type="number"
              step="0.0001"
              {...register('DESIREDTENOR_YEARS', { valueAsNumber: true })}
              className={inputClass(!!errors.DESIREDTENOR_YEARS)}
              placeholder="5"
              min={1}
              max={30}
            />
            {errors.DESIREDTENOR_YEARS && (
              <p className="error-text">{errors.DESIREDTENOR_YEARS.message}</p>
            )}
          </div>
        </div>
      </section>

      {/* Additional Metrics */}
      <section className="card animate-fade-in" style={{ animationDelay: '0.5s' }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
          Cash Plus Info
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="label">ETB / NTB</label>
            <Controller
              name="ETB_NTB"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.ETB_NTB)}>
                  <option value="">Select ETB/NTB</option>
                  <option value="NTB">NTB</option>
                  <option value="ETB">ETB</option>
                </select>
              )}
            />
            {errors.ETB_NTB && <p className="error-text">{errors.ETB_NTB.message}</p>}
          </div>

          <div>
            <label className="label">Origin City</label>
            <Controller
              name="ORIGINCITY"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.ORIGINCITY)}>
                  <option value="">Select city</option>
                  <option value="Peshawar">Peshawar</option>
                  <option value="Multan">Multan</option>
                  <option value="Karachi">Karachi</option>
                  <option value="Hyderabad">Hyderabad</option>
                  <option value="Sukkar">Sukkar</option>
                  <option value="Rawalpindi/Islamabad">Rawalpindi/Islamabad</option>
                  <option value="Faisalabad">Faisalabad</option>
                  <option value="Taxila">Taxila</option>
                  <option value="Others">Others</option>
                  <option value="Lahore">Lahore</option>
                  <option value="Sargodha">Sargodha</option>
                </select>
              )}
            />
            {errors.ORIGINCITY && <p className="error-text">{errors.ORIGINCITY.message}</p>}
          </div>

          <div>
            <label className="label">Median Balance</label>
            <Controller
              name="MEDIAN_BALANCE"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.MEDIAN_BALANCE)}>
                  <option value="">Select Balance Range</option>
                  <option value="Not_Available">Not Available</option>
                  <option value="0-1K">0-1K</option>
                  <option value="1K-5K">1K-5K</option>
                  <option value="5K-15K">5K-15K</option>
                  <option value=">15K">&gt;15K</option>
                </select>
              )}
            />
            {errors.MEDIAN_BALANCE && <p className="error-text">{errors.MEDIAN_BALANCE.message}</p>}
          </div>

          <div>
            <label className="label">ECIB Months Diff</label>
            <Controller
              name="ECIB_MONTHS_DIFF"
              control={control}
              render={({ field }) => (
                <select {...field} className={inputClass(!!errors.ECIB_MONTHS_DIFF)}>
                  <option value="">Select value</option>
                  <option value="New_To_Industry">New To Industry</option>
                  <option value="Existing_To_Industry">Existing To Industry</option>
                </select>
              )}
            />
            {errors.ECIB_MONTHS_DIFF && <p className="error-text">{errors.ECIB_MONTHS_DIFF.message}</p>}
          </div>
        </div>
      </section>

      {/* File Upload */}
      <section className="card animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Supporting Documents
        </h2>
        <FileUpload />
      </section>

      {/* Submit */}
      <div className="flex justify-end gap-4 animate-fade-in" style={{ animationDelay: '0.6s' }}>
        <button type="button" onClick={() => reset(DEFAULT_VALUES)} className="btn btn-secondary" disabled={isLoading}>
          Reset
        </button>

        <button type="submit" className="btn btn-primary px-8" disabled={isLoading}>
          {isLoading ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Processing...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              Assess Risk
            </>
          )}
        </button>
      </div>
        </div>

        {/* Right column: Liability Scorecard */}
        {liabilityScorecard && (
          <div className="lg:col-span-1">
            <div className="card bg-gradient-to-b from-blue-50 to-white border border-blue-200 sticky top-6">
              <div className="space-y-2 mb-4">
                <h3 className="text-lg font-bold text-[#1a5a7a]">Liability Scorecard</h3>
                {/* <p className="text-sm text-gray-600">Account balance analysis</p> */}
              </div>
              <LiabilityScoreCard data={liabilityScorecard} />
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
``
