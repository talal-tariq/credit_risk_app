import { Header, LoanForm, Results, StartPage, Login } from './components';
import { useStore } from './store/useStore';

function App() {
  const { activeView, error, setError } = useStore();

  return (
    <div className="h-full flex flex-col bg-[#f5f5f5]">
      {/* Header */}
      {activeView !== 'login' && <Header />}

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border-b border-red-200 px-4 py-3 flex items-center justify-between animate-slide-in">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="p-1 rounded hover:bg-red-100 transition-colors"
          >
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Content Area */}
      <main className="flex-1 overflow-y-auto">
        {activeView === 'login' && <Login />}
        {activeView === 'start' && <StartPage />}
        {activeView === 'form' && <LoanForm />}
        {activeView === 'results' && <Results />}
      </main>
    </div>
  );
}

export default App;
