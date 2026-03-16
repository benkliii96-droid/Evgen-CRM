import { useState, useEffect } from 'react';
import { Link } from '../router';

const API_URL = '';

export function Profile({ darkMode, setDarkMode, user, onLogout }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  
  // Смена пароля
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  
  // Редактирование профиля
  const [username, setUsername] = useState(user?.username || '');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user?.avatar) {
      setAvatarPreview(user.avatar);
    }
  }, [user]);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Размер файла не должен превышать 5MB');
      return;
    }
    
    // Проверка типа
    if (!file.type.startsWith('image/')) {
      setError('Файл должен быть изображением');
      return;
    }
    
    // Превью
    const reader = new FileReader();
    reader.onload = (e) => setAvatarPreview(e.target.result);
    reader.readAsDataURL(file);
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/avatar/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка загрузки');
      }
      
      const data = await res.json();
      setAvatarPreview(data.avatar);
      setSuccess('Аватар успешно обновлён');
    } catch (err) {
      setError(err.message);
      // Возвращаем старый аватар
      setAvatarPreview(user?.avatar || null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/change-password/`, {
        method: 'POST',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm
        })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка смены пароля');
      }
      
      setSuccess('Пароль успешно изменён');
      setCurrentPassword('');
      setNewPassword('');
      setNewPasswordConfirm('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const token = localStorage.getItem('token');
    
    try {
      const res = await fetch(`${API_URL}/api/auth/profile/`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username })
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Ошибка обновления профиля');
      }
      
      setSuccess('Профиль успешно обновлён');
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] transition-colors">
      {/* Header */}
      <header className="bg-white dark:bg-[#25213b] shadow-sm border-b border-[#e8e4ff] dark:border-[#3d3860]">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 text-[#6e6893] dark:text-[#b8b3d4] hover:text-[#6d5bd0] dark:hover:text-[#6d5bd0] transition-colors"
            >
              <img src="/chevron-left.svg" alt="Назад" className="w-5 h-5" />
              <span className="font-['Inter'] text-[14px]">Назад</span>
            </Link>
            <h1 className="font-['Inter'] font-bold text-[20px] md:text-[24px] text-[#25213b] dark:text-white">
              Личный кабинет
            </h1>
          </div>
          <div className="flex items-center gap-3">
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
            <button
              onClick={onLogout}
              className="w-10 h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d]"
              title="Выйти"
            >
              <img src="/logout.svg" alt="Выйти" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 md:py-10">
        {/* Сообщения */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-['Inter'] text-[14px]">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-['Inter'] text-[14px]">
            {success}
          </div>
        )}

        {/* Профиль - Аватар и имя */}
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8e4ff] dark:border-[#3d3860] mb-6">
          <h2 className="font-['Inter'] font-bold text-[18px] text-[#25213b] dark:text-white mb-6">
            Профиль
          </h2>
          
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Аватар */}
            <div className="flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-[#f8f7ff] dark:bg-[#2d2847] border-4 border-[#6d5bd0] overflow-hidden flex items-center justify-center">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Аватар" className="w-full h-full object-cover" />
                ) : (
                  <svg className="w-12 h-12 text-[#6e6893] dark:text-[#b8b3d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <label className="cursor-pointer px-4 py-2 bg-[#6d5bd0] hover:bg-[#5d4bc0] text-white text-[13px] rounded-xl font-['Inter'] font-medium transition-colors">
                {loading ? 'Загрузка...' : 'Загрузить аватар'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={loading}
                />
              </label>
            </div>
            
            {/* Имя пользователя */}
            <div className="flex-1 w-full">
              {isEditing ? (
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-4">
                    <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                      Имя пользователя
                    </label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white text-[13px] rounded-xl font-['Inter'] font-medium transition-colors"
                    >
                      Сохранить
                    </button>
                    <button
                      type="button"
                      onClick={() => { setIsEditing(false); setUsername(user?.username || ''); }}
                      className="px-4 py-2 bg-[#f8f7ff] dark:bg-[#2d2847] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] text-[#6e6893] dark:text-[#b8b3d4] text-[13px] rounded-xl font-['Inter'] font-medium transition-colors"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white">
                      {user?.username}
                    </h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="text-[#6d5bd0] hover:text-[#5d4bc0] text-[13px] font-['Inter']"
                    >
                      Изменить
                    </button>
                  </div>
                  <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                    Роль: {user?.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </p>
                  <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                    ID: {user?.id}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Смена пароля */}
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-6 md:p-8 shadow-sm border border-[#e8e4ff] dark:border-[#3d3860]">
          <h2 className="font-['Inter'] font-bold text-[18px] text-[#25213b] dark:text-white mb-6">
            Смена пароля
          </h2>
          
          <form onSubmit={handlePasswordChange}>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Текущий пароль
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  required
                />
              </div>
              <div>
                <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Подтвердите новый пароль
                </label>
                <input
                  type="password"
                  value={newPasswordConfirm}
                  onChange={(e) => setNewPasswordConfirm(e.target.value)}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  required
                  minLength={6}
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-[#6d5bd0] hover:bg-[#5d4bc0] disabled:opacity-50 text-white text-[14px] rounded-xl font-['Inter'] font-medium transition-colors"
            >
              {loading ? 'Сохранение...' : 'Изменить пароль'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
