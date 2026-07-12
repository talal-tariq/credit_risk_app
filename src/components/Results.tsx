import { useState } from 'react';
import { useStore } from '../store/useStore';
import { IncomeTable } from './IncomeTable';
import { IncomeChart } from './IncomeChart';
import { FeatureContributions } from './FeatureContributions';
import { LiabilityScoreCard } from './LiabilityScoreCard';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

// Collapsible section component
function CollapsibleSection({ 
  title, 
  icon, 
  children, 
  defaultOpen = true,
  compact = false
}: { 
  title: string; 
  icon: React.ReactNode; 
  children: React.ReactNode;
  defaultOpen?: boolean;
  compact?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          'w-full flex items-center justify-between hover:bg-gray-50 transition-colors border-b border-gray-100',
          compact ? 'px-4 py-3' : 'px-6 py-4'
        )}
      >
        <div className="flex items-center gap-2">
          <div className={clsx(
            'rounded-lg bg-blue-50 flex items-center justify-center text-[#1a5a7a]',
            compact ? 'w-6 h-6' : 'w-8 h-8'
          )}>
            {icon}
          </div>
          <span className={clsx('font-semibold text-gray-800', compact ? 'text-sm' : '')}>{title}</span>
        </div>
        <svg
          className={clsx(
            'w-4 h-4 text-gray-400 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && <div className={compact ? 'p-4' : 'p-6'}>{children}</div>}
    </div>
  );
}

// Markdown renderer component
function MarkdownContent({ content }: { content: string }) {
  return (
    <div className="prose prose-sm max-w-none prose-headings:text-gray-800 prose-p:text-gray-600 prose-strong:text-gray-700 prose-ul:text-gray-600 prose-ol:text-gray-600">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}

export function Results() {
  const { 
    currentAssessment, 
    incomeAssessment,
    featureContributions,
    liabilityScorecard,
    modelIntercept,
    transactionAnalysis,
    modelExplanationText,
    decision,
    commentary,
    counterOffers,
    setActiveView 
  } = useStore();

  if (!currentAssessment) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No Assessment Selected</h2>
          <p className="text-gray-400 mb-4">Submit an application to see risk assessment results</p>
          <button onClick={() => setActiveView('start')} className="btn btn-primary">
            Start New Assessment
          </button>
        </div>
      </div>
    );
  }

  const getRiskConfig = (category: 'low' | 'medium' | 'high') => {
    const configs = {
      low: {
        color: 'text-green-700',
        bg: 'bg-green-50',
        border: 'border-green-200',
        label: 'Low Risk',
      },
      medium: {
        color: 'text-yellow-700',
        bg: 'bg-yellow-50',
        border: 'border-yellow-200',
        label: 'Medium Risk',
      },
      high: {
        color: 'text-red-700',
        bg: 'bg-red-50',
        border: 'border-red-200',
        label: 'High Risk',
      },
    };
    return configs[category];
  };

  const riskConfig = getRiskConfig(currentAssessment.riskCategory);

  // Calculate gauge rotation (0-180 degrees for 0-1 score)
  const gaugeRotation = currentAssessment.riskScore * 180;

  return (
    <div className="w-full p-4 space-y-4">
      {/* Top Score Card - Full Width */}
      <div className="card animate-slide-up">
        <div className="flex flex-col md:flex-row gap-6 items-center p-4">
          {/* Risk Gauge */}
          <div className="relative w-40 h-20 overflow-hidden">
            {/* Gauge Background */}
            <div className="absolute inset-0 rounded-t-full border-8 border-gray-100" />
            
            {/* Gauge Segments */}
            <div className="absolute inset-0 rounded-t-full overflow-hidden">
              <div className="absolute inset-0 rounded-t-full border-8 border-red-300" style={{ clipPath: 'polygon(0 100%, 0 0, 50% 0, 50% 100%)' }} />
              <div className="absolute inset-0 rounded-t-full border-8 border-yellow-300" style={{ clipPath: 'polygon(50% 100%, 50% 0, 70% 0, 70% 100%)' }} />
              <div className="absolute inset-0 rounded-t-full border-8 border-green-300" style={{ clipPath: 'polygon(70% 100%, 70% 0, 100% 0, 100% 100%)' }} />
            </div>

            {/* Needle */}
            <div
              className="absolute bottom-0 left-1/2 w-1 h-16 bg-gray-800 origin-bottom transition-transform duration-1000 ease-out"
              style={{ transform: `translateX(-50%) rotate(${gaugeRotation - 90}deg)` }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-gray-800 absolute -top-1 left-1/2 -translate-x-1/2" />
            </div>

            {/* Center dot */}
            <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-white rounded-full -translate-x-1/2 translate-y-1/2 border-2 border-gray-800" />
          </div>

          {/* Score Details */}
          <div className="flex-1 text-center md:text-left">
            <p className="text-sm text-gray-500 mb-1">Credit Risk Score</p>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <span className="text-4xl font-bold text-gray-800">{(currentAssessment.riskScore * 100).toFixed(0)}</span>
              <span className="text-xl text-gray-400">/100</span>
            </div>
            <div
              className={clsx(
                'inline-flex items-center gap-2 px-3 py-1 rounded-full border text-sm',
                riskConfig.bg,
                riskConfig.border,
                riskConfig.color
              )}
            >
              <span className="font-medium">{riskConfig.label}</span>
            </div>
          </div>

          {/* New Assessment Button */}
          <button onClick={() => setActiveView('start')} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Assessment
          </button>
        </div>
      </div>

      {/* Three-Pane Layout */}
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Left Pane - 25% - Feature Contributions (Score Card) */}
        <div className="w-full lg:w-1/4 space-y-4">
          {featureContributions && (
            <CollapsibleSection
              title="Score Card"
              compact
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              <FeatureContributions data={featureContributions} intercept={modelIntercept} />
            </CollapsibleSection>
          )}
        </div>

        {/* Center Pane - 50% - Chart, Transaction Analysis, Model Explanation */}
        <div className="w-full lg:w-1/2 space-y-4">
          {/* Income Chart */}
          {incomeAssessment && (
            <CollapsibleSection
              title="Income Trend"
              compact
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              }
            >
              <IncomeChart data={incomeAssessment} />
            </CollapsibleSection>
          )}

          {/* Transaction Analysis */}
          {transactionAnalysis && (
            <CollapsibleSection
              title="Transaction Analysis"
              compact
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
            >
              <MarkdownContent content={transactionAnalysis} />
            </CollapsibleSection>
          )}

          {/* Model Explanation */}
          {modelExplanationText && (
            <CollapsibleSection
              title="Model Explanation"
              compact
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            >
              <MarkdownContent content={modelExplanationText} />
            </CollapsibleSection>
          )}
          {(decision === 'LIKELY_DEFAULT' || decision === 'COUNTER_OFFER') &&
            (commentary || counterOffers.length > 0) && (
              <CollapsibleSection
                title="Decision Commentary"
                compact
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              >
                <div className="text-sm text-gray-600 space-y-3">
                  {commentary && <p>{commentary}</p>}
                  {decision === 'COUNTER_OFFER' && counterOffers.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                        Counter Offers
                      </p>
                      <div className="space-y-2">
                        {counterOffers.map((offer, index) => (
                          <div key={`${offer.DESIREDAMT}-${offer.DESIREDTENOR_YEARS}-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
                            <div className="flex items-center justify-between text-sm text-gray-700">
                              <span>Amount</span>
                              <span className="font-medium">
                                {offer.DESIREDAMT.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-700">
                              <span>Tenor</span>
                              <span className="font-medium">{offer.DESIREDTENOR_YEARS} years</span>
                            </div>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>Score</span>
                              <span>{(((offer.original_score ?? offer.Y_score) ?? 0) * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CollapsibleSection>
            )}
        </div>

        {/* Right Pane - 25% - Income Assessment Table */}

        <div className="w-full lg:w-1/4 space-y-4">
          {incomeAssessment && (
            <CollapsibleSection
              title="Income Assessment"
              compact
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2" />
                </svg>
              }
            >
              <IncomeTable data={incomeAssessment} />
            </CollapsibleSection>
          )}

          {/* Liability Score Card */}
          <CollapsibleSection
            title="Liability Score Card"
            compact
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7h18M6 12h12M9 17h6" />
              </svg>
            }
          >
            {liabilityScorecard ? (
              <LiabilityScoreCard data={liabilityScorecard} />
            ) : (
              <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
                Liability scorecard is not available yet. Once backend sends <b>liability_scorecard</b>, it will appear here automatically.
              </div>
            )}
          </CollapsibleSection>
        </div>

      </div>
    </div>
  );
}
