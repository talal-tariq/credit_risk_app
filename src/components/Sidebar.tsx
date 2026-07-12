import { useStore } from '../store/useStore';
import type { AssessmentRecord } from '../types';
import clsx from 'clsx';

export function Sidebar() {
  const {
    isSidebarOpen,
    activeView,
    setActiveView,
    assessmentHistory,
    removeFromHistory,
    clearHistory,
    setCurrentAssessment,
    clearExplanation,
    clearFormDraft,
    clearUploadedFile,
    clearChat,
    setDecision,
    setCommentary,
    setCounterOffers,
  } = useStore();

  const handleNewAssessment = () => {
    clearFormDraft();
    clearUploadedFile();
    clearExplanation();
    clearChat();
    setDecision(null);
    setCommentary(null);
    setCounterOffers([]);
    setCurrentAssessment(null);
    setActiveView('start');
  };

  const handleSelectHistory = (record: AssessmentRecord) => {
    // Clear previous chat when viewing different assessment
    clearChat();
    clearExplanation();
    setDecision(null);
    setCommentary(null);
    setCounterOffers([]);
    // In a real app, you would fetch the full assessment
    setCurrentAssessment({
      id: record.id,
      applicationId: record.id,
      riskScore: record.riskScore,
      riskCategory: record.riskCategory,
      defaultProbability: record.riskScore / 100,
      recommendation: record.recommendation,
      factors: [],
      createdAt: record.createdAt,
    });
    setActiveView('results');
  };

  const getRiskBadgeClass = (category: 'low' | 'medium' | 'high') => {
    return {
      low: 'bg-green-500/20 text-green-400',
      medium: 'bg-yellow-500/20 text-yellow-400',
      high: 'bg-red-500/20 text-red-400',
    }[category];
  };

  if (!isSidebarOpen) {
    return null;
  }

  return (
    <aside className="w-72 h-full bg-primary-light border-r border-border flex flex-col animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <button onClick={handleNewAssessment} className="btn btn-primary w-full">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Assessment
        </button>
      </div>

      {/* Navigation */}
      <nav className="p-2">
        <button
          onClick={() => setActiveView('start')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors',
            activeView === 'form' || activeView === 'start'
              ? 'bg-accent/20 text-accent'
              : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Application Form
        </button>

        <button
          onClick={() => setActiveView('history')}
          className={clsx(
            'w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors mt-1',
            activeView === 'history'
              ? 'bg-accent/20 text-accent'
              : 'text-text-secondary hover:bg-surface-light hover:text-text-primary'
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          History
          {assessmentHistory.length > 0 && (
            <span className="ml-auto text-xs bg-surface-light px-2 py-0.5 rounded-full">
              {assessmentHistory.length}
            </span>
          )}
        </button>
      </nav>

      {/* Recent Assessments */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-xs font-medium text-text-muted uppercase tracking-wider">
            Recent Assessments
          </span>
          {assessmentHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="text-xs text-text-muted hover:text-accent transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {assessmentHistory.length === 0 ? (
          <div className="px-3 py-8 text-center text-text-muted text-sm">
            <svg
              className="w-12 h-12 mx-auto mb-3 opacity-50"
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
            No assessments yet
          </div>
        ) : (
          <div className="space-y-1">
            {assessmentHistory.map((record) => (
              <div
                key={record.id}
                className="group relative p-3 rounded-lg hover:bg-surface-light transition-colors cursor-pointer"
                onClick={() => handleSelectHistory(record)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">
                      {record.applicantName}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      ${record.loanAmount.toLocaleString()}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'text-xs px-2 py-0.5 rounded-full font-medium',
                      getRiskBadgeClass(record.riskCategory)
                    )}
                  >
                    {record.riskScore}%
                  </span>
                </div>
                <p className="text-xs text-text-muted mt-1">
                  {new Date(record.createdAt).toLocaleDateString()}
                </p>

                {/* Delete button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromHistory(record.id);
                  }}
                  className="absolute top-2 right-2 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-surface transition-all"
                >
                  <svg
                    className="w-4 h-4 text-text-muted hover:text-accent"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="text-xs text-text-muted text-center">
          Loan Risk Assessment v1.0
        </div>
      </div>
    </aside>
  );
}
