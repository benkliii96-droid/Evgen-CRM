import { useState, useEffect } from 'react';
import { Link } from '../router';
import { NotificationsPanel } from './NotificationsPanel';

const API_URL = '';

export function AdminLayout({ user, onLogout, darkMode, setDarkMode, children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  
  const isAdmin = user?.is_admin || user?.role === 'admin';

  useEffect(() => {
    if (isAdmin) {
      fetchPendingCount();
      const interval = setInterval(fetchPendingCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAdmin]);

  const fetchPendingCount = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/api/notifications/pending_requests/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const data = await res.json();
      setPendingCount(data.total || 0);
    } catch (err) {
      console.error(err);
    }
  };
  
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
            <div className="relative">
<button
                onClick={() => setShowNotifications(true)}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-colors ${
                  pendingCount > 0 
                    ? 'bg-[#fef3c7] dark:bg-[#451a03] border-[#f59e0b] dark:border-[#d97706]' 
                    : 'bg-[#f8f7ff] dark:bg-[#2d2847] border-[#e8e4ff] dark:border-[#3d3860] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]'
                }`}
                title="Уведомления"
              >
                <img 
                  src="/bell.svg" 
                  alt="Уведомления" 
                  className={`w-5 h-5 transition-all dark:brightness-200 ${pendingCount > 0 ? 'animate-pulse' : ''}`} 
                />
              </button>
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {pendingCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-10 h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
            >
              {darkMode ? (
                <img src="/sun.svg" alt="Солнце" className="w-5 h-5" />
              ) : (
                <img src="/moon.svg" alt="Луна" className="w-5 h-5" />
              )}
            </button>
            <Link
              to="/profile/"
              className="flex items-center gap-2 text-[#6e6893] dark:text-[#b8b3d4] hover:text-[#6d5bd0] dark:hover:text-[#6d5bd0] transition-colors"
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Аватар" className="w-8 h-8 rounded-full object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#f8f7ff] dark:bg-[#2d2847] flex items-center justify-center">
                  <svg className="w-4 h-4 text-[#6e6893] dark:text-[#b8b3d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )}
              <span className="font-['Inter'] text-[14px]">{user?.username}</span>
            </Link>
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
            <Link
              to="/admin/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Главная
            </Link>
            <Link
              to="/admin/products/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Товары
            </Link>
            <Link
              to="/admin/users/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Пользователи
            </Link>
            <Link
              to="/admin/requests/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Запросы
            </Link>
            <Link
              to="/admin/categories/"
              className="block px-4 py-3 rounded-xl font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Категории
            </Link>
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
          isAdmin={isAdmin}
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
