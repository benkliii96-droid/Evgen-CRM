export function Header({ totalCost, darkMode, setDarkMode, user, onLogout, onNotificationsClick }) {
  const isAdmin = user?.role === 'admin' || user?.is_admin
  
  return (
    <div className="flex items-center justify-between gap-3 mb-4 md:mb-6">
      <h1 className="font-['Inter'] font-bold text-[24px] sm:text-[28px] md:text-[32px] text-[#6e6893] dark:text-[#b8b3d4] tracking-wide">
        CMS
      </h1>
      <div className="flex items-center gap-2 sm:gap-4">
        {isAdmin && (
          <a
            href="/admin/"
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#6d5bd0] text-white font-['Inter'] text-[12px] md:text-[13px] font-medium hover:bg-[#5d4bc0] transition-colors"
          >
            <img src="./Key.svg" alt="Админ" className="w-4 h-4" />
            <span className="hidden sm:inline">Админ</span>
          </a>
        )}
        {user && onNotificationsClick && (
          <div className="relative">
            <button
              onClick={onNotificationsClick}
              className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-[#25213b] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] transition-colors flex-shrink-0"
              type="button"
              aria-label="Уведомления"
              title="Уведомления"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 dark:brightness-200 text-[#6e6893] dark:text-[#b8b3d4]">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
            </button>
            {false && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                0
              </span>
            )}
          </div>
        )}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-[#25213b] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] transition-colors flex-shrink-0"
          type="button"
          aria-label="Переключить тему"
        >
          {darkMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#6e6893] dark:text-[#b8b3d4]">
                <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 text-[#6e6893] dark:text-[#b8b3d4]">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
        </button>
        <div className="bg-white dark:bg-[#25213b] rounded-xl px-3 sm:px-4 md:px-6 py-2 sm:py-3 border border-[#e8e4ff] dark:border-[#3d3860]">
          <p className="font-['Inter'] font-normal text-[11px] sm:text-[13px] md:text-[14px]">
            <span className="font-medium text-[#6e6893] dark:text-[#b8b3d4]">Итого: </span>
            <span className="font-bold text-[#6d5bd0] text-[14px] sm:text-[16px] md:text-[18px]">${totalCost.toFixed(2)}</span>
          </p>
        </div>
        {user && (
          <button
            onClick={onLogout}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white dark:bg-[#25213b] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d] transition-colors flex-shrink-0"
            type="button"
            aria-label="Выйти"
            title="Выйти"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 sm:w-6 sm:h-6 dark:brightness-200 text-[#6e6893] dark:text-[#b8b3d4]">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}
