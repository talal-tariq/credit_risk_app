import { useStore } from '../store/useStore';
import clsx from 'clsx';

export function History() {
  const { assessmentHistory, removeFromHistory, clearHistory, setCurrentAssessment, setActiveView } =
    useStore();

  const handleViewDetails = (record: typeof assessmentHistory[0]) => {
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
      low: 'bg-green-500/20 text-green-400 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      high: 'bg-red-500/20 text-red-400 border-red-500/30',
    }[category];
  };

  const getRecommendationBadge = (rec: 'approve' | 'review' | 'reject') => {
    return {
      approve: { class: 'bg-green-500/10 text-green-400', label: 'Approve' },
      review: { class: 'bg-yellow-500/10 text-yellow-400', label: 'Review' },
      reject: { class: 'bg-red-500/10 text-red-400', label: 'Reject' },
    }[rec];
  };

  if (assessmentHistory.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-text-muted mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-xl font-semibold text-text-primary mb-2">No History Yet</h2>
          <p className="text-text-muted mb-4">Your completed assessments will appear here</p>
          <button onClick={() => setActiveView('form')} className="btn btn-primary">
            Start First Assessment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold text-text-primary">Assessment History</h2>
          <p className="text-text-muted text-sm mt-1">
            {assessmentHistory.length} assessment{assessmentHistory.length !== 1 ? 's' : ''} completed
          </p>
        </div>
        <button onClick={clearHistory} className="btn btn-ghost text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
          Clear All
        </button>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-light/50">
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  Applicant
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  Loan Amount
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  Risk Score
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  Recommendation
                </th>
                <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">
                  Date
                </th>
                <th className="text-right px-4 py-3 text-sm font-medium text-text-secondary">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {assessmentHistory.map((record, index) => {
                const recBadge = getRecommendationBadge(record.recommendation);

                return (
                  <tr
                    key={record.id}
                    className="hover:bg-surface-light/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <td className="px-4 py-4">
                      <span className="font-medium text-text-primary">{record.applicantName}</span>
                    </td>
                    <td className="px-4 py-4 text-text-secondary">
                      ${record.loanAmount.toLocaleString()}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={clsx(
                          'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-medium border',
                          getRiskBadgeClass(record.riskCategory)
                        )}
                      >
                        <span>{record.riskScore}%</span>
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={clsx(
                          'inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium',
                          recBadge.class
                        )}
                      >
                        {recBadge.label}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-text-muted text-sm">
                      {new Date(record.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(record)}
                          className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                          title="View Details"
                        >
                          <svg
                            className="w-4 h-4 text-text-secondary hover:text-text-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => removeFromHistory(record.id)}
                          className="p-2 rounded-lg hover:bg-surface-light transition-colors"
                          title="Delete"
                        >
                          <svg
                            className="w-4 h-4 text-text-secondary hover:text-accent"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
