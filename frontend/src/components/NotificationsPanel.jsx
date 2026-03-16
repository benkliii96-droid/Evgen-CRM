import { useState, useEffect } from 'react';

const API_URL = '';

export function NotificationsPanel({ darkMode, onClose, user, isAdmin = false }) {
const [notifications, setNotifications] = useState([]);
  const [showUnreadOnly, setShowUnreadOnly] = useState(true);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [productRequests, setProductRequests] = useState([]);
  const [categoryRequests, setCategoryRequests] = useState([]);
  
  // Для выбора заявок
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  useEffect(() => {
    if (isAdmin) {
      fetchPendingRequests();
    } else {
      fetchNotifications();
    }
    // Опрос каждую минуту
    const interval = setInterval(isAdmin ? fetchPendingRequests : fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchPendingRequests = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_URL}/api/requests/products/?status=pending`, {
          headers: { 'Authorization': `Token ${token}` }
        }),
        fetch(`${API_URL}/api/requests/categories/?status=pending`, {
          headers: { 'Authorization': `Token ${token}` }
        })
      ]);

      const prodData = await prodRes.json();
      const catData = await catRes.json();

      setProductRequests(prodData.results || prodData);
      setCategoryRequests(catData.results || catData);
      setUnreadCount((prodData.results?.length || prodData.length || 0) + (catData.results?.length || catData.length || 0));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
      await fetch(`${API_URL}/api/notifications/mark_all_read_/`, {
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

  const getRequestStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs px-2 py-1 rounded-full font-['Inter']">На рассмотрении</span>;
      case 'approved':
        return <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-full font-['Inter']">Одобрено</span>;
      case 'rejected':
        return <span className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs px-2 py-1 rounded-full font-['Inter']">Отклонено</span>;
      default:
        return null;
    }
  };

  // Обработка выбора заявок
  const toggleSelect = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedIds([]);
    } else {
      const allIds = [
        ...productRequests.map(r => `product-${r.id}`),
        ...categoryRequests.map(r => `category-${r.id}`)
      ];
      setSelectedIds(allIds);
    }
    setSelectAll(!selectAll);
  };

  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    
    setBulkActionLoading(true);
    const token = localStorage.getItem('token');
    
    const productIds = selectedIds.filter(id => id.startsWith('product-')).map(id => parseInt(id.replace('product-', '')));
    const categoryIds = selectedIds.filter(id => id.startsWith('category-')).map(id => parseInt(id.replace('category-', '')));
    
    try {
      // Одобряем товары
      if (productIds.length > 0) {
        await fetch(`${API_URL}/api/requests/products/bulk_approve/`, {
          method: 'POST',
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: productIds })
        });
      }
      
      // Одобряем категории
      if (categoryIds.length > 0) {
        await fetch(`${API_URL}/api/requests/categories/bulk_approve/`, {
          method: 'POST',
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: categoryIds })
        });
      }
      
      setSelectedIds([]);
      setSelectAll(false);
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.length === 0) return;
    
    const comment = prompt('Введите комментарий (причина отклонения):');
    if (comment === null) return;
    
    setBulkActionLoading(true);
    const token = localStorage.getItem('token');
    
    const productIds = selectedIds.filter(id => id.startsWith('product-')).map(id => parseInt(id.replace('product-', '')));
    const categoryIds = selectedIds.filter(id => id.startsWith('category-')).map(id => parseInt(id.replace('category-', '')));
    
    try {
      // Отклоняем товары
      if (productIds.length > 0) {
        await fetch(`${API_URL}/api/requests/products/bulk_reject/`, {
          method: 'POST',
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: productIds, comment })
        });
      }
      
      // Отклоняем категории
      if (categoryIds.length > 0) {
        await fetch(`${API_URL}/api/requests/categories/bulk_reject/`, {
          method: 'POST',
          headers: { 
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ ids: categoryIds, comment })
        });
      }
      
      setSelectedIds([]);
      setSelectAll(false);
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleApprove = async (type, id) => {
    const token = localStorage.getItem('token');
    try {
      const endpoint = type === 'product' 
        ? `${API_URL}/api/requests/products/${id}/approve/`
        : `${API_URL}/api/requests/categories/${id}/approve/`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      
      // Обновить список
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (type, id) => {
    const token = localStorage.getItem('token');
    const comment = prompt('Введите комментарий (причина отклонения):');
    if (comment === null) return;
    
    try {
      const endpoint = type === 'product'
        ? `${API_URL}/api/requests/products/${id}/reject/`
        : `${API_URL}/api/requests/categories/${id}/reject/`;
      
      await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });
      
      // Обновить список
      fetchPendingRequests();
    } catch (err) {
      console.error(err);
    }
  };

  // Если админ - показываем заявки
  if (isAdmin) {
    const allRequests = [
      ...productRequests.map(r => ({ ...r, type: 'product', selectId: `product-${r.id}` })),
      ...categoryRequests.map(r => ({ ...r, type: 'category', selectId: `category-${r.id}` }))
    ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-4 md:p-6 border-b border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white">
                Заявки
              </h2>
              {unreadCount > 0 && (
                <span className="bg-[#f59e0b] text-white text-xs px-2 py-1 rounded-full font-['Inter'] font-medium">
                  {unreadCount}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] flex items-center justify-center"
            >
              <img src="/close.svg" alt="Закрыть" className="w-5 h-5" />
            </button>
          </div>

          {/* Bulk Actions Toolbar */}
          {allRequests.length > 0 && (
            <div className="px-4 py-3 border-b border-[#e8e4ff] dark:border-[#3d3860] bg-[#f8f7ff] dark:bg-[#2d2847]/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded border-[#8b83ba] text-[#6d5bd0] focus:ring-[#6d5bd0]"
                    />
                    <span className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                      {selectAll ? 'Отменить всё' : 'Выбрать все'}
                    </span>
                  </label>
                  <span className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                    {selectedIds.length > 0 ? `Выбрано: ${selectedIds.length}` : ''}
                  </span>
                </div>
                
                {selectedIds.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={handleBulkApprove}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-xs rounded-lg font-['Inter'] font-medium transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      Одобрить выбранные
                    </button>
                    <button
                      onClick={handleBulkReject}
                      disabled={bulkActionLoading}
                      className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs rounded-lg font-['Inter'] font-medium transition-colors flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Отклонить выбранные
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-[#6e6893] dark:text-[#b8b3d4] font-['Inter']">
                Загрузка...
              </div>
            ) : allRequests.length === 0 ? (
              <div className="p-8 text-center text-[#6e6893] dark:text-[#b8b3d4] font-['Inter']">
                Нет новых заявок
              </div>
            ) : (
              <div className="divide-y divide-[#e8e4ff] dark:divide-[#3d3860]">
                {allRequests.map(req => (
                  <div 
                    key={`${req.type}-${req.id}`} 
                    className={`p-4 hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors ${
                      selectedIds.includes(req.selectId) ? 'bg-[#f4f2ff] dark:bg-[#2d2847]/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div className="pt-1">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(req.selectId)}
                          onChange={() => toggleSelect(req.selectId)}
                          className="w-4 h-4 rounded border-[#8b83ba] text-[#6d5bd0] focus:ring-[#6d5bd0]"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs px-2 py-1 rounded-full font-['Inter'] ${
                              req.type === 'product' 
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' 
                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            }`}>
                              {req.type === 'product' ? 'Товар' : 'Категория'}
                            </span>
                            {getRequestStatusBadge(req.status)}
                          </div>
                          <span className="font-['Inter'] text-[12px] text-[#8b83ba] dark:text-[#6e6893]">
                            {formatDate(req.created_at)}
                          </span>
                        </div>
                        <h3 className="font-['Inter'] font-semibold text-[14px] text-[#25213b] dark:text-white mb-1">
                          {req.name}
                        </h3>
                        <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                          От: {req.user_username || req.user?.username || 'Неизвестно'}
                          {req.category_name && ` • ${req.category_name}`}
                        </p>
                        {req.type === 'product' && (
                          <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-3">
                            Цена: {req.price} ₽ • Кол-во: {req.quantity} {req.unit}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(req.type, req.id)}
                            className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-['Inter'] font-medium transition-colors flex items-center gap-1"
                          >
                            <img src="/check.svg" alt="" className="w-3.5 h-3.5" />
                            Одобрить
                          </button>
                          <button
                            onClick={() => handleReject(req.type, req.id)}
                            className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs rounded-lg font-['Inter'] font-medium transition-colors flex items-center gap-1"
                          >
                            <img src="/close.svg" alt="" className="w-3.5 h-3.5" />
                            Отклонить
                          </button>
                        </div>
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'product_approved':
      case 'category_approved':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">

            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>

          </div>
        );
      case 'product_rejected':
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

            <div className="flex items-center gap-3">
              <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white">
                Уведомления
              </h2>
              <button
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className="px-3 py-1 rounded-lg text-xs font-['Inter'] bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
              >
                {showUnreadOnly ? 'Все' : 'Непрочитанные'}
              </button>
            </div>

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
            <img src="/close.svg" alt="Закрыть" className="w-5 h-5" />
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
{notifications.filter(n => !showUnreadOnly || !n.is_read).map(notif => (
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
