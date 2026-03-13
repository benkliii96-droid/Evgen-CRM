import { useState, useEffect } from 'react';

const API_URL = '';

export function NotificationsPanel({ darkMode, onClose, user }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
    // Опрос каждую минуту
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [notifRes, countRes] = await Promise.all([
        fetch(`${API_URL}/api/notifications/`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${API_URL}/api/notifications/unread_count/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ]);

      const notifs = await notifRes.json();
      const countData = await countRes.json();

      setNotifications(notifs.results || notifs);
      setUnreadCount(countData.unread_count);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/notifications/${id}/mark_read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/notifications/mark_all_read/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Только что';
    if (minutes < 60) return `${minutes} мин. назад`;
    if (hours < 24) return `${hours} ч. назад`;
    if (days < 7) return `${days} дн. назад`;
    return date.toLocaleDateString('ru-RU');
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'product_approved':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'product_rejected':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'category_approved':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'category_rejected':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      case 'new_request':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[480px] max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white">
              Уведомления
            </h2>
            {unreadCount > 0 && (
              <span className="bg-[#6d5bd0] text-white text-xs px-2 py-1 rounded-full font-['Inter'] font-medium">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] flex items-center justify-center"
          >
            <svg className="w-5 h-5 text-[#6e6893] dark:text-[#b8b3d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="px-4 py-2 border-b border-[#e8e4ff] dark:border-[#3d3860] flex justify-end">
            <button
              onClick={markAllAsRead}
              className="font-['Inter'] text-[13px] text-[#6d5bd0] hover:underline"
            >
              Отметить все как прочитанные
            </button>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-[#6e6893] dark:text-[#b8b3d4] font-['Inter']">
              Загрузка...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-[#6e6893] dark:text-[#b8b3d4] font-['Inter']">
              Уведомлений нет
            </div>
          ) : (
            <div className="divide-y divide-[#e8e4ff] dark:divide-[#3d3860]">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  onClick={() => !notif.is_read && markAsRead(notif.id)}
                  className={`p-4 hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] cursor-pointer transition-colors ${
                    !notif.is_read ? 'bg-[#f4f2ff] dark:bg-[#2d2847]/50' : ''
                  }`}
                >
                  <div className="flex gap-3">
                    {getTypeIcon(notif.notification_type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="font-['Inter'] font-semibold text-[14px] text-[#25213b] dark:text-white">
                          {notif.title}
                        </h3>
                        {!notif.is_read && (
                          <div className="w-2 h-2 rounded-full bg-[#6d5bd0] flex-shrink-0 mt-1.5"></div>
                        )}
                      </div>
                      <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mt-1 line-clamp-2">
                        {notif.message}
                      </p>
                      <p className="font-['Inter'] text-[12px] text-[#8b83ba] dark:text-[#6e6893] mt-1">
                        {formatDate(notif.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
