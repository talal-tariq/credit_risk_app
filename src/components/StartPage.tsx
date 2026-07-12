
import { useState, type FormEvent } from 'react';
import { checkCnic } from '../services/apiClient';
import { useStore } from '../store/useStore';

export function StartPage() {
  const [cnicInput, setCnicInput] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [reason, setReason] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { setActiveView, setIsEligible, setCnic, setLiabilityScorecard } = useStore();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedCnic = cnicInput.trim();

    if (!trimmedCnic) {
      setMessage('Please enter a CNIC number.');
      setReason(null);
      setIsEligible(false);
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setReason(null);

    const response = await checkCnic(trimmedCnic);

    if (!response.success || !response.data) {
      setMessage(response.error || 'Unable to verify CNIC at this time.');
      setReason(null);
      setIsEligible(false);
      setIsSubmitting(false);
      return;
    }

    // Extract eligibility from the new response structure
    const { status, eligibility, liability_scorecard } = response.data;

    if (eligibility.eligible && status === 'success') {
      setIsSubmitting(false);
      setCnic(trimmedCnic);
      // Set liability scorecard as-is (can be null, object, or error message string)
      // The LiabilityScoreCard component will handle all cases
      setLiabilityScorecard(liability_scorecard);
      setIsEligible(true);
      setActiveView('form');
      return;
    }

    // User is not eligible - reset liability scorecard and show error
    setLiabilityScorecard(null);
    setMessage(
      eligibility.message ||
        'Sorry, we are unable to proceed with your application at this time.'
    );
    setReason(eligibility.reason || null);
    setIsEligible(false);
    setIsSubmitting(false);
  };

  // Optional: keep only digits (CNIC is numeric)
  const handleCnicChange = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    setCnicInput(digitsOnly);
  };

  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden px-4 py-12 flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-sky-100">
      {/* Decorative background blobs (no blank background anymore) */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-sky-300/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/3 h-64 w-64 rounded-full bg-indigo-300/15 blur-3xl" />

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-lg rounded-2xl border border-white/60 bg-white/80 backdrop-blur-xl shadow-xl p-8 space-y-6"
      >
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            CNIC Verification
          </h1>
          <p className="text-base text-gray-600">
            Enter Customer's CNIC to start the Credit Risk Assessment.
          </p>
        </div>

        {/* CNIC input */}
        <div>
          <label htmlFor="cnic" className="block text-base font-semibold text-gray-800">
            CNIC Number
          </label>

          <div className="mt-2">
            <input
              id="cnic"
              name="cnic"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              value={cnicInput}
              onChange={(event) => handleCnicChange(event.target.value)}
              placeholder="e.g. 4220100555879"
              maxLength={13}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-lg text-gray-900 shadow-sm
                         focus:border-[#1a5a7a] focus:outline-none focus:ring-4 focus:ring-[#1a5a7a]/20"
            />
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Tip: CNIC should be 13 digits (without dashes).
          </p>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full inline-flex items-center justify-center rounded-xl px-5 py-3 text-base font-semibold text-white
                     bg-gradient-to-r from-[#1a5a7a] to-[#2980b9]
                     shadow-md hover:shadow-lg hover:brightness-110 transition
                     disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="inline-flex items-center gap-2">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Checking...
            </span>
          ) : (
            'Send'
          )}
        </button>

        {/* Warning / Error message (RED highlight) */}
        {message && (
          <div
            className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 shadow-sm animate-[fadeIn_200ms_ease-out]"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-700">
                ⚠️
              </span>
              <div className="space-y-1">
                <p className="text-base font-semibold">{message}</p>
                {reason && (
                  <p className="text-sm text-red-700">
                    <span className="font-semibold">Reason:</span> {reason}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </form>

      {/* Tailwind custom keyframe fallback if your setup doesn't have animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </section>
  );
}
