import { useState, useEffect } from 'react';

const API_URL = '';

export function AdminRequests() {
  const [productRequests, setProductRequests] = useState([]);
  const [categoryRequests, setCategoryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const token = localStorage.getItem('token');
    try {
      const [productsRes, categoriesRes] = await Promise.all([
fetch(`${API_URL}/api/requests/products/?status=pending`, { headers: { 'Authorization': `Token ${token}` } }),
fetch(`${API_URL}/api/requests/categories/?status=pending`, { headers: { 'Authorization': `Token ${token}` } })
      ]);
      setProductRequests(await productsRes.json());
      setCategoryRequests(await categoriesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProduct = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/requests/products/${id}/approve/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectProduct = async (id) => {
    const comment = prompt('Комментарий (необязательно):');
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/requests/products/${id}/reject/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleApproveCategory = async (id) => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/requests/categories/${id}/approve/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRejectCategory = async (id) => {
    const comment = prompt('Комментарий (необязательно):');
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/requests/categories/${id}/reject/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment })
      });
      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400',
      approved: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
    };
    const labels = {
      pending: 'Ожидает',
      approved: 'Одобрено',
      rejected: 'Отклонено'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-['Inter'] ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  if (loading) {
    return <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white mb-6">
        Запросы
      </h2>

      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl font-['Inter'] text-[14px] ${
            activeTab === 'products' 
              ? 'bg-[#6d5bd0] text-white' 
              : 'bg-white dark:bg-[#25213b] text-[#6e6893] dark:text-[#b8b3d4] border border-[#e8e4ff] dark:border-[#3d3860]'
          }`}
        >
          Товары ({productRequests.filter(r => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl font-['Inter'] text-[14px] ${
            activeTab === 'categories' 
              ? 'bg-[#6d5bd0] text-white' 
              : 'bg-white dark:bg-[#25213b] text-[#6e6893] dark:text-[#b8b3d4] border border-[#e8e4ff] dark:border-[#3d3860]'
          }`}
        >
          Категории ({categoryRequests.filter(r => r.status === 'pending').length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="space-y-4">
          {productRequests.length === 0 ? (
            <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
              Нет запросов
            </div>
          ) : (
            productRequests.map(req => (
              <div key={req.id} className="bg-white dark:bg-[#25213b] rounded-xl p-4 border border-[#e8e4ff] dark:border-[#3d3860]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white">{req.name}</h3>
                    <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                      От: {req.user_username} | {req.category_name} | ${req.price} x {req.quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(req.status)}
                    {req.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveProduct(req.id)}
                          className="text-green-600 hover:underline font-['Inter'] text-[14px]"
                        >
                          Одобрить
                        </button>
                        <button 
                          onClick={() => handleRejectProduct(req.id)}
                          className="text-red-500 hover:underline font-['Inter'] text-[14px]"
                        >
                          Отклонить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="space-y-4">
          {categoryRequests.length === 0 ? (
            <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
              Нет запросов
            </div>
          ) : (
            categoryRequests.map(req => (
              <div key={req.id} className="bg-white dark:bg-[#25213b] rounded-xl p-4 border border-[#e8e4ff] dark:border-[#3d3860]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white">{req.name}</h3>
                    <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">От: {req.user_username}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(req.status)}
                    {req.status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApproveCategory(req.id)}
                          className="text-green-600 hover:underline font-['Inter'] text-[14px]"
                        >
                          Одобрить
                        </button>
                        <button 
                          onClick={() => handleRejectCategory(req.id)}
                          className="text-red-500 hover:underline font-['Inter'] text-[14px]"
                        >
                          Отклонить
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
