import { useState, useEffect } from 'react';

const API_URL = '';

export function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/auth/users/`, {
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(res => res.ok ? res.json() : Promise.reject())
      .then(data => setUsers(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>;
  }

  return (
    <div>
      <h2 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white mb-6">
        Пользователи
      </h2>
      
      {users.length === 0 ? (
        <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
          Нет пользователей
        </div>
      ) : (
        <div className="bg-white dark:bg-[#25213b] rounded-xl overflow-hidden border border-[#e8e4ff] dark:border-[#3d3860]">
          <table className="w-full">
            <thead className="bg-[#f8f7ff] dark:bg-[#2d2847]">
              <tr>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">ID</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Имя</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Email</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Роль</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Дата</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-t border-[#e8e4ff] dark:border-[#3d3860]">
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white">{user.id}</td>
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white">{user.username}</td>
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#6e6893]">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-['Inter'] ${
                      user.role === 'admin' ? 'bg-[#6d5bd0] text-white' : 'bg-[#e8e4ff] text-[#6e6893] dark:bg-[#2d2847] dark:text-[#b8b3d4]'
                    }`}>
                      {user.role === 'admin' ? 'Админ' : 'Пользователь'}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#6e6893]">
                    {new Date(user.created_at).toLocaleDateString('ru')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
