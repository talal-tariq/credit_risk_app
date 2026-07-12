import type { IncomeAssessment } from '../services/apiClient';

interface IncomeTableProps {
  data: IncomeAssessment;
}

export function IncomeTable({ data }: IncomeTableProps) {
  // Format date to show month/year
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50">Date</th>
            <th className="text-right py-3 px-4 font-semibold text-gray-700 bg-gray-50">Income</th>
          </tr>
        </thead>
        <tbody>
          {data.monthly_salaries.map((entry, index) => (
            <tr 
              key={entry.date} 
              className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
            >
              <td className="py-2.5 px-4 text-gray-600">{formatDate(entry.date)}</td>
              <td className="py-2.5 px-4 text-right text-gray-800 font-medium">
                {formatCurrency(entry.salary)}
              </td>
            </tr>
          ))}
          {/* Estimated Income Row */}
          <tr className="border-t-2 border-[#1a5a7a] bg-blue-50">
            <td className="py-3 px-4 font-semibold text-[#1a5a7a]">Estimated Income</td>
            <td className="py-3 px-4 text-right font-bold text-[#1a5a7a] text-base">
              {formatCurrency(data.estimated_salary)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
