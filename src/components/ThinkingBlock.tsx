import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import type { ExplanationStep } from '../types';
import clsx from 'clsx';

interface ThinkingBlockProps {
  steps: ExplanationStep[];
  isComplete: boolean;
}

export function ThinkingBlock({ steps, isComplete }: ThinkingBlockProps) {
  // Auto-expand all steps by default
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  // Expand all steps automatically when they arrive
  useEffect(() => {
    if (steps.length > 0) {
      setExpandedSteps(new Set(steps.map(s => s.id)));
    }
  }, [steps]);

  const toggleStep = (stepId: string) => {
    setExpandedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(stepId)) {
        next.delete(stepId);
      } else {
        next.add(stepId);
      }
      return next;
    });
  };

  const getStepIcon = (step: ExplanationStep) => {
    if (step.status === 'streaming') {
      return (
        <div className="w-5 h-5 flex items-center justify-center">
          <div className="w-2 h-2 bg-[#1a5a7a] rounded-full animate-pulse" />
        </div>
      );
    }

    if (step.status === 'complete') {
      return (
        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      );
    }

    return (
      <div className="w-5 h-5 flex items-center justify-center">
        <div className="w-2 h-2 bg-text-muted rounded-full" />
      </div>
    );
  };

  const getStepTypeLabel = (type: ExplanationStep['type']) => {
    const labels = {
      analysis: 'Analysis',
      factor: 'Risk Factor',
      recommendation: 'Recommendation',
      summary: 'Summary',
    };
    return labels[type];
  };

  const getStepTypeColor = (type: ExplanationStep['type']) => {
    const colors = {
      analysis: 'bg-blue-100 text-blue-700',
      factor: 'bg-yellow-100 text-yellow-700',
      recommendation: 'bg-purple-100 text-purple-700',
      summary: 'bg-green-100 text-green-700',
    };
    return colors[type];
  };

  if (steps.length === 0) {
    return (
      <div className="card p-6 animate-fade-in">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <svg className="w-4 h-4 text-[#1a5a7a] animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
          </div>
          <div>
            <p className="text-gray-800 font-medium">Generating Explanation</p>
            <p className="text-gray-400 text-sm">The AI is analyzing the risk assessment...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card overflow-hidden animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-[#1a5a7a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          <span className="font-medium text-gray-800">AI Explanation</span>
        </div>
        {!isComplete && (
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-[#1a5a7a] rounded-full animate-pulse" />
            Processing
          </span>
        )}
      </div>

      <div className="divide-y divide-border">
        {steps.map((step, index) => {
          const isExpanded = expandedSteps.has(step.id) || step.status === 'streaming';

          return (
            <div
              key={step.id}
              className={clsx(
                'transition-colors',
                step.status === 'streaming' && 'bg-amber-50/50'
              )}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Step Header */}
              <button
                onClick={() => toggleStep(step.id)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors"
              >
                {getStepIcon(step)}
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span
                      className={clsx(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        getStepTypeColor(step.type)
                      )}
                    >
                      {getStepTypeLabel(step.type)}
                    </span>
                    <span className="text-sm font-medium text-gray-800">{step.title}</span>
                  </div>
                </div>
                <svg
                  className={clsx(
                    'w-4 h-4 text-gray-400 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Step Content */}
              {isExpanded && step.content && (
                <div className="px-4 pb-4 pl-12">
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ className, children, ...props }) {
                          const match = /language-(\w+)/.exec(className || '');
                          const inline = !match;
                          return inline ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <SyntaxHighlighter
                              style={oneDark}
                              language={match[1]}
                              PreTag="div"
                              customStyle={{
                                margin: 0,
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                              }}
                            >
                              {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                          );
                        },
                      }}
                    >
                      {step.content}
                    </ReactMarkdown>
                    {step.status === 'streaming' && (
                      <span className="inline-block w-2 h-4 bg-[#1a5a7a] animate-pulse ml-1" />
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {isComplete && (
        <div className="p-4 border-t border-border bg-green-50">
          <div className="flex items-center gap-2 text-green-700 text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Analysis complete
          </div>
        </div>
      )}
    </div>
  );
}
