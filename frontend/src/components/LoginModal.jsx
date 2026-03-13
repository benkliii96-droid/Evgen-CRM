import { useState } from 'react';

const API_URL = '';

export function LoginModal({ onClose, onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    username: '',
    password: '',
    password_confirm: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (isLogin) {
        const res = await fetch(`${API_URL}/api/auth/login/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: form.username, password: form.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка входа');
        onLogin(data.user, data.token);
      } else {
        if (form.password !== form.password_confirm) {
          setError('Пароли не совпадают');
          setLoading(false);
          return;
        }
        const res = await fetch(`${API_URL}/api/auth/register/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: form.username,
            password: form.password,
            password_confirm: form.password_confirm
          })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Ошибка регистрации');
        onLogin(data.user, data.token);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[400px] p-6">
        <h2 className="font-['Inter'] font-bold text-[24px] text-[#25213b] dark:text-white mb-6 text-center">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>

        {error && (
          <div className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-xl mb-4 font-['Inter'] text-[14px]">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Имя пользователя
            </label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            />
          </div>

          <div>
            <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Пароль
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Подтвердите пароль
              </label>
              <input
                type="password"
                value={form.password_confirm}
                onChange={(e) => setForm({ ...form, password_confirm: e.target.value })}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#6d5bd0] h-[48px] rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0] disabled:opacity-50"
          >
            {loading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Зарегистрироваться')}
          </button>
        </form>

        <p className="font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] mt-4 text-center">
          {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[#6d5bd0] hover:underline"
          >
            {isLogin ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </p>
      </div>
    </div>
  );
}
