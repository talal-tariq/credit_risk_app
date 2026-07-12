export function Header() {

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200">
      <div className="flex items-center gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1a5a7a] to-[#2980b9] flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">UBL</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-gray-800">UBL Credit Risk App</h1>
            <p className="text-xs text-gray-500">Loan Risk Assessment</p>
          </div>
        </div>
      </div>
    </header>
  );
}
