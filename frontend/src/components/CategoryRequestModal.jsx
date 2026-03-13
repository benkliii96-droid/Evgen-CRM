import { useState } from 'react';

const API_URL = '';

export function CategoryRequestModal({ onClose }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name || name.length < 2) {
      setError('Название категории обязательно (мин. 2 символа)');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/requests/categories/`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Token ${token}`
        },
        body: JSON.stringify({ name })
      });
      
      if (!res.ok) {
        throw new Error('Ошибка отправки');
      }
      
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      setError('Ошибка отправки');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[360px] p-6 text-center">
          <img src="/check.svg" alt="Успешно" className="w-20 h-20 mx-auto mb-4" />
          <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-2">
            Заявка отправлена
          </h2>
          <p className="font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4]">
            Ожидайте одобрения администратора
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[400px] p-6">
        <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4">
          Предложить категорию
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 font-['Inter'] text-[14px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Название категории *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(''); }}
              placeholder="Например: Бытовые приборы"
              className={`w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border outline-none focus:border-[#6d5bd0] ${
                error ? 'border-red-500' : 'border-[#e8e4ff] dark:border-[#3d3860]'
              }`}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[48px] rounded-xl border border-[#e8e4ff] dark:border-[#3d3860] font-['Inter'] font-semibold text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847]"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-[#6d5bd0] h-[48px] rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0] disabled:opacity-50"
            >
              {loading ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
