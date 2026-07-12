import type { IncomeAssessment } from '../services/apiClient';

interface IncomeChartProps {
  data: IncomeAssessment;
}

export function IncomeChart({ data }: IncomeChartProps) {
  const salaries = data.monthly_salaries;
  const maxSalary = Math.max(...salaries.map(s => s.salary), data.estimated_salary) * 1.1; // Add 10% padding
  
  // Format month abbreviation
  const formatMonth = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short' });
  };

  // Format currency in compact form
  const formatCompact = (amount: number) => {
    if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K`;
    }
    return amount.toFixed(0);
  };

  // Calculate bar height percentage
  const getBarHeight = (salary: number) => {
    return (salary / maxSalary) * 100;
  };

  // Calculate estimated salary line position
  const estimatedLinePosition = getBarHeight(data.estimated_salary);

  return (
    <div className="w-full">
      {/* Chart Container */}
      <div className="relative h-52">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-400 pr-2 text-right">
          <span>{formatCompact(maxSalary)}</span>
          <span>{formatCompact(maxSalary / 2)}</span>
          <span>0</span>
        </div>
        
        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-0">
          {/* Grid lines */}
          <div className="absolute inset-0 bottom-8 flex flex-col justify-between pointer-events-none">
            <div className="border-b border-gray-100" />
            <div className="border-b border-gray-100" />
            <div className="border-b border-gray-200" />
          </div>

          {/* Estimated salary horizontal line */}
          <div 
            className="absolute left-0 right-0 border-t-2 border-dashed border-orange-400 z-10 pointer-events-none"
            style={{ bottom: `calc(${estimatedLinePosition}% + 32px)` }}
          >
            <span className="absolute -top-4 right-0 text-xs font-medium text-orange-500 bg-white px-1 rounded">
              Est: {formatCompact(data.estimated_salary)}
            </span>
          </div>

          {/* Bars Container */}
          <div className="absolute inset-0 bottom-8 flex items-end gap-2 px-1">
            {salaries.map((entry) => {
              const barHeight = getBarHeight(entry.salary);
              return (
                <div 
                  key={entry.date} 
                  className="flex-1 flex flex-col items-center relative group"
                  style={{ height: '100%' }}
                >
                  {/* Bar */}
                  <div className="absolute bottom-0 left-1 right-1 flex flex-col justify-end" style={{ height: '100%' }}>
                    <div
                      className="w-full bg-[#00a88e] hover:bg-[#008f78] rounded-t-sm transition-all duration-300 cursor-pointer"
                      style={{ height: `${barHeight}%` }}
                    />
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                    PKR {entry.salary.toLocaleString()}
                  </div>
                </div>
              );
            })}
          </div>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 h-8 flex gap-2 px-1">
            {salaries.map((entry) => (
              <div key={entry.date} className="flex-1 text-center">
                <span className="text-xs text-gray-500">{formatMonth(entry.date)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-2 text-xs text-gray-600">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 bg-[#00a88e] rounded-sm" />
          <span>Monthly Income</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 border-t-2 border-dashed border-orange-400" />
          <span>Estimated Salary</span>
        </div>
      </div>
    </div>
  );
}