import clsx from 'clsx';

interface FeatureContributionsProps {
  data: Record<string, number | string | undefined>;
  intercept?: number | null;
}

const featureLabels: Record<string, string> = {
  AGE: 'Age',
  NODEPEND: 'Number of Dependents',
  NOCHILD: 'Number of Children',
  CALCINCOME: 'Calculated Income',
  DESIREDAMT: 'Desired Amount',
  DESIREDTENOR_YEARS: 'Loan Tenor (Years)',
  DEBTBURDEN: 'Debt Burden',
  ALLOWEDDEBTBURDEN: 'Allowed Debt Burden',
  AGGREGATEEXPOSURE: 'Aggregate Exposure',
  GENDER: 'Gender',
  MSTATUS: 'Marital Status',
  EDLEVEL: 'Education Level',
  CURRESIDENCETYPE: 'Residence Type',
  CURREMPTYPE: 'Employment Type',
  CURREMPSTATUS: 'Employment Status',
  ETB_NTB: 'ETB / NTB',
  ORIGINCITY: 'Origin City',
  MEDIAN_BALANCE: 'Median Balance',
  ECIB_MONTHS_DIFF: 'ECIB Months Diff',
  TENOR_YEARS: 'Tenor (Years)',
};

export function FeatureContributions({ data }: FeatureContributionsProps) {
  const scorecardEntries = Object.entries(data)
    .filter(([key, value]) => {
      if (key === 'TOTAL_POINTS') return false;
      return typeof value === 'number' && !isNaN(value);
    })
    .map(([key, value]) => ({
      key,
      label: featureLabels[key] || key,
      value: value as number,
    }))
    .sort((a, b) => b.value - a.value);

  const totalPoints = typeof data.TOTAL_POINTS === 'number' ? data.TOTAL_POINTS : 0;
  const maxValue = Math.max(...scorecardEntries.map((entry) => entry.value), 1);

  return (
    <div className="overflow-x-auto">
      <div className="mb-3 text-sm font-semibold text-[#1a5a7a]">
        CashPlus Scorecard
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50 w-1/2">
              Factor
            </th>
            <th className="text-left py-3 px-4 font-semibold text-gray-700 bg-gray-50 w-1/2">
              Points
            </th>
          </tr>
        </thead>
        <tbody>
          {scorecardEntries.map((entry, index) => (
            <tr key={entry.key} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
              <td className="py-3 px-4 text-gray-700 font-medium">{entry.label}</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden relative">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1a5a7a] to-[#0b5a78]"
                      style={{ width: `${(entry.value / maxValue) * 100}%` }}
                    />
                  </div>
                  <span className="font-semibold text-[#1a5a7a] min-w-[3rem] text-right">
                    {entry.value}
                  </span>
                </div>
              </td>
            </tr>
          ))}
          <tr className="border-t-2 border-[#1a5a7a] bg-blue-50">
            <td className="py-3 px-4 font-semibold text-[#1a5a7a]">Total Points</td>
            <td className="py-3 px-4 text-right font-bold text-base text-[#1a5a7a]">
              {totalPoints}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
