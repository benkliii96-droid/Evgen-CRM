import { useState, useEffect } from 'react';

const API_URL = '';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${API_URL}/api/categories/`, { 
        headers: { 'Authorization': `Token ${token}` } 
      });
      setCategories(await res.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white">
          Категории
        </h2>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl mb-4">
        <p className="font-['Inter'] text-[14px] text-blue-700 dark:text-blue-300">
          ℹ️ Категории добавляются автоматически при одобрении заявок пользователей.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
          Нет категорий
        </div>
      ) : (
        <div className="space-y-2">
          {categories.map(cat => (
            <div
              key={cat.id}
              className="bg-white dark:bg-[#25213b] rounded-xl p-4 border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-[#f8f7ff] dark:bg-[#2d2847] flex items-center justify-center">
                  <span className="font-['Inter'] font-bold text-[14px] text-[#6d5bd0]">
                    {cat.sort_order || cat.id}
                  </span>
                </div>
                <div>
                  <p className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white">
                    {cat.name}
                  </p>
                  <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4]">
                    {cat.products_count || 0} товаров
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-['Inter'] ${
                cat.is_active !== false
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
              }`}>
                {cat.is_active !== false ? 'Активна' : 'Неактивна'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
