import { useState } from 'react';
import { NotificationsPanel } from './NotificationsPanel';

export function AdminLayout({ user, onLogout, darkMode, setDarkMode, children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  
  return (
    <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625]">
      <header className="bg-white dark:bg-[#25213b] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/" className="font-['Inter'] font-bold text-[24px] text-[#6d5bd0]">
              CMS
            </a>
            <span className="text-[#6e6893] dark:text-[#b8b3d4]">/</span>
            <span className="font-['Inter'] font-semibold text-[18px] text-[#25213b] dark:text-white">
              Админ-панель
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowNotifications(true)}
              className="w-10 h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
              title="Уведомления"
            >
              <img src="/bell.svg" alt="Уведомления" className="w-5 h-5 dark:brightness-200" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
            >
              {darkMode ? (
                <img src="/sun.svg" alt="Светлая тема" className="w-5 h-5" />
              ) : (
                <img src="/moon.svg" alt="Тёмная тема" className="w-5 h-5" />
              )}
            </button>
            <span className="font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4]">{user?.username}</span>
            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d] transition-colors"
              title="Выйти"
            >
              <img src="/logout.svg" alt="Выйти" className="w-5 h-5 dark:brightness-200" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 bg-white dark:bg-[#25213b] min-h-[calc(100vh-64px)] p-4 border-r border-[#e8e4ff] dark:border-[#3d3860]">
          <nav className="space-y-2">
            <a
              href="/admin/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Главная
            </a>
            <a
              href="/admin/products/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Товары
            </a>
            <a
              href="/admin/users/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Пользователи
            </a>
            <a
              href="/admin/requests/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Запросы
            </a>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>

      {showNotifications && (
        <NotificationsPanel
          darkMode={darkMode}
          onClose={() => setShowNotifications(false)}
          user={user}
        />
      )}
    </div>
  );
}

export function AdminDashboard({ stats }) {
  return (
    <div>
      <h2 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white mb-6">
        Обзор
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-6 border border-[#e8e4ff] dark:border-[#3d3860]">
          <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">Товаров</p>
          <p className="font-['Inter'] font-bold text-[32px] text-[#25213b] dark:text-white">{stats?.total_products || 0}</p>
        </div>
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-6 border border-[#e8e4ff] dark:border-[#3d3860]">
          <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">Категорий</p>
          <p className="font-['Inter'] font-bold text-[32px] text-[#25213b] dark:text-white">{stats?.categories_count || 0}</p>
        </div>
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-6 border border-[#e8e4ff] dark:border-[#3d3860]">
          <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">Пользователей</p>
          <p className="font-['Inter'] font-bold text-[32px] text-[#25213b] dark:text-white">{stats?.users_count || 0}</p>
        </div>
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-6 border border-[#e8e4ff] dark:border-[#3d3860]">
          <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">Новые запросы</p>
          <p className="font-['Inter'] font-bold text-[32px] text-[#6d5bd0]">{stats?.pending_requests || 0}</p>
        </div>
      </div>

      <div className="mt-6 bg-white dark:bg-[#25213b] rounded-2xl p-6 border border-[#e8e4ff] dark:border-[#3d3860]">
        <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">Общая стоимость товаров</p>
        <p className="font-['Inter'] font-bold text-[40px] text-[#6d5bd0]">${stats?.total_value?.toFixed(2) || '0.00'}</p>
      </div>
    </div>
  );
}
