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
            <img src="/Key.svg" alt="Админ" className="w-4 h-4" />
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
              <img src="/bell.svg" alt="Уведомления" className="w-5 h-5 sm:w-6 sm:h-6 dark:brightness-200" />
            </button>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {unreadCount > 99 ? '99+' : unreadCount}
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
          <img src={darkMode ? '/sun.svg' : '/moon.svg'} alt="Тема" className="w-5 h-5 sm:w-6 sm:h-6" />
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
            <img src="/logout.svg" alt="Выйти" className="w-5 h-5 sm:w-6 sm:h-6 dark:brightness-200" />
          </button>
        )}
      </div>
    </div>
  )
}
