
// import clsx from 'clsx';
import { useState } from 'react';
import type { LiabilityScorecard } from '../services/apiClient';

interface LiabilityScoreCardProps {
  data?: LiabilityScorecard | null;
}

// const formatCurrency = (amount?: number) => {
//   if (amount === null || amount === undefined || Number.isNaN(amount)) return '-';
//   return new Intl.NumberFormat('en-PK', {
//     style: 'currency',
//     currency: 'PKR',
//     minimumFractionDigits: 0,
//     maximumFractionDigits: 0,
//   }).format(amount);
// };

// const formatNumber = (val?: number) => {
//   if (val === null || val === undefined || Number.isNaN(val)) return '-';
//   return val.toLocaleString(undefined, { maximumFractionDigits: 2 });
// };

// function TrendBadge({ value }: { value?: string }) {
//   const normalized = (value || '').toUpperCase();
//   const isPos = normalized === 'POSITIVE';
//   const isNeg = normalized === 'NEGATIVE';

//   return (
//     <span
//       className={clsx(
//         'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold border',
//         isPos && 'bg-green-50 text-green-700 border-green-200',
//         isNeg && 'bg-red-50 text-red-700 border-red-200',
//         !isPos && !isNeg && 'bg-gray-50 text-gray-700 border-gray-200'
//       )}
//     >
//       {value || 'N/A'}
//     </span>
//   );
// }

const formatValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
};

const formatLabel = (key: string): string => {
  return key
    .replace(/_/g, ' ')
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

interface TooltipProps {
  description: string;
}

function Tooltip({ description }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
            clipRule="evenodd"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-96 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
          {description}
        </div>
      )}
    </div>
  );
}

const glossary: Record<string, string> = {
  AVGDAILYBALANCE: 'Average Daily Balance - Mean balance maintained across all accounts on a daily basis',
  AVGMONTHLYCREDITAMOUNT: 'Avg Monthly Credit Amount - Average credit transactions processed per month',
  AVGMONTHLYDEBITAMOUNT: 'Avg Monthly Debit Amount - Average debit transactions processed per month',
  AVGMONTHLYCREDITTRXNCOUNT: 'Avg Monthly Credit Trxn Count - Average number of credit transactions per month',
  AVGMONTHLYDEBITTRXNCOUNT: 'Avg Monthly Debit Trxn Count - Average number of debit transactions per month',
  STDMONTHLYCREDITAMOUNT: 'Std Monthly Credit Amount - Standard deviation of monthly credit amounts',
  CVMONTHLYCREDITAMOUNT: 'Cv Monthly Credit Amount - Coefficient of variation for monthly credit amounts',
  STDMONTHLYDEBITAMOUNT: 'Std Monthly Debit Amount - Standard deviation of monthly debit amounts',
  CVMONTHLYDEBITAMOUNT: 'Cv Monthly Debit Amount - Coefficient of variation for monthly debit amounts',
  STDMONTHLYCREDITTRXNCOUNT: 'Std Monthly Credit Trxn Count - Standard deviation of monthly credit transaction counts',
  CVMONTHLYCREDITTRXNCOUNT: 'Cv Monthly Credit Trxn Count - Coefficient of variation for monthly credit transaction counts',
  STDMONTHLYDEBITTRXNCOUNT: 'Std Monthly Debit Trxn Count - Standard deviation of monthly debit transaction counts',
  CVMONTHLYDEBITTRXNCOUNT: 'Cv Monthly Debit Trxn Count - Coefficient of variation for monthly debit transaction counts',
  DEBITCREDITRATIO: 'Debit/credit Ratio - Ratio of total debit transactions to credit transactions',
};

const getDescription = (key: string): string => {
  const upperKey = key?.toUpperCase?.() || '';
  
  // Try exact match
  if (glossary[upperKey]) {
    return glossary[upperKey];
  }
  
  // Try removing underscores and spaces
  const normalizedKey = upperKey.replace(/[_\s]/g, '');
  if (glossary[normalizedKey]) {
    return glossary[normalizedKey];
  }
  
  return 'No description available';
};

export function LiabilityScoreCard({ data: inputData }: LiabilityScoreCardProps) {
  // Debug logging
  console.log('[LiabilityScoreCard] Received:', inputData);

  // Handle null or undefined data
  if (!inputData) {
    console.log('[LiabilityScoreCard] Data is null/undefined');
    return (
      <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm text-blue-700">
        No record found
      </div>
    );
  }

  // Handle case where data is a string (error message or needs parsing)
  let data: any = inputData;
  if (typeof data === 'string') {
    console.log('[LiabilityScoreCard] Data is string:', data);
    // Check if it looks like an error message
    const isErrorMessage = data.toLowerCase().includes('no record') || 
                          data.toLowerCase().includes('error') ||
                          data.toLowerCase().includes('not found');
    
    if (isErrorMessage) {
      console.log('[LiabilityScoreCard] Detected error message');
      return (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-700">
          {data}
        </div>
      );
    }

    // Try to parse as JSON
    try {
      data = JSON.parse(data);
      console.log('[LiabilityScoreCard] Successfully parsed string as JSON');
    } catch (e) {
      console.log('[LiabilityScoreCard] String is not valid JSON:', e);
      return (
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
          Invalid liability scorecard data format.
        </div>
      );
    }
  }

  // Handle case where data is an array (shouldn't happen, but defensive programming)
  if (Array.isArray(data)) {
    console.log('[LiabilityScoreCard] Data is array, which is invalid');
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
        Invalid liability scorecard format: expected object but received array.
      </div>
    );
  }

  // Ensure data is an object
  if (typeof data !== 'object' || data === null) {
    console.log('[LiabilityScoreCard] Data is not a valid object');
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
        Invalid liability scorecard format: expected object.
      </div>
    );
  }

  console.log('[LiabilityScoreCard] Valid data. Keys:', Object.keys(data));

  // Extract total_score separately
  const totalScore = data.total_score;
  
  // Filter entries, excluding total_score and system fields
  const entries = Object.entries(data)
    .filter(([key, value]) => {
      if (value === null || value === undefined) return false;
      if (key === 'total_score' || key === 'APPINPDATE') return false;
      if (key?.toUpperCase?.() === 'APPINPDATE') return false;
      return true;
    });

  // Return empty state if no entries
  if (entries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-600">
        No liability scorecard entries available.
      </div>
    );
  }

  // Check if new format (entries have 'value' and 'points' properties)
  const isNewFormat = entries.length > 0 && 
    entries[0] &&
    typeof entries[0][1] === 'object' && 
    entries[0][1] !== null &&
    'value' in entries[0][1] && 
    'points' in entries[0][1];

  return (
    <div className="space-y-4">
      {isNewFormat ? (
        // New format: 3 columns (Group, Category, Points)
        <div className="space-y-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-300 bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Group</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700">Category</th>
                  <th className="px-3 py-2 text-right font-semibold text-gray-700">Points</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(([key, entry]: [string, any]) => {
                  if (!entry || typeof entry !== 'object' || !('value' in entry) || !('points' in entry)) {
                    return null;
                  }
                  
                  const formattedGroup = formatLabel(key);
                  const categoryValue: string = String(entry.value) || '-';
                  const points: number = Number(entry.points) ?? 0;

                  return (
                    <tr key={key} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-3 py-2 text-gray-700 font-medium">{formattedGroup}</td>
                      <td className="px-3 py-2 text-gray-600">{categoryValue}</td>
                      <td className="px-3 py-2 text-right text-gray-800 font-semibold">
                        {points >= 0 ? '+' : ''}{formatValue(points)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {/* Total Score Row */}
          {totalScore !== null && totalScore !== undefined && (
            <div className="mt-4 pt-4 border-t-2 border-gray-300">
              <div className="flex items-center justify-between px-3 py-3 rounded-md bg-blue-50 border border-blue-200">
                <span className="text-sm font-semibold text-gray-800">Total Score</span>
                <span className="text-lg font-bold text-blue-600">
                  {formatValue(totalScore)}
                </span>
              </div>
            </div>
          )}
        </div>
      ) : (
        // Legacy format: 2 columns (Field Name, Field Value)
        <div className="space-y-2">
          {entries.map(([key, value]) => {
            const formattedLabel = formatLabel(key);
            const description = getDescription(key);

            return (
              <div
                key={key}
                className="flex items-center justify-between px-3 py-2 rounded-md bg-white border border-gray-200"
              >
                <div className="flex items-center gap-1">
                  <span className="text-sm font-medium text-gray-600">
                    {formattedLabel}
                  </span>
                  <Tooltip description={description} />
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {formatValue(value)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
