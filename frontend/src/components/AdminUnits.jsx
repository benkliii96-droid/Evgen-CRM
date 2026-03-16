import { useState, useEffect } from 'react';

const API_URL = '';

export function AdminUnits() {
  const [groups, setGroups] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUnitModal, setShowUnitModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [editingUnit, setEditingUnit] = useState(null);
  const [activeTab, setActiveTab] = useState('groups');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [groupsRes, unitsRes] = await Promise.all([
        fetch(`${API_URL}/api/unit-groups/`, { headers: { 'Authorization': `Token ${token}` } }),
        fetch(`${API_URL}/api/units/`, { headers: { 'Authorization': `Token ${token}` } })
      ]);
      setGroups(await groupsRes.json());
      setUnits(await unitsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveGroup = async (formData) => {
    const token = localStorage.getItem('token');
    const data = {};
    formData.forEach((value, key) => {
      if (key === 'is_active') {
        data[key] = value === 'true';
      } else if (key === 'sort_order') {
        data[key] = parseInt(value) || 0;
      } else {
        data[key] = value;
      }
    });

    try {
      let res;
      if (editingGroup) {
        res = await fetch(`${API_URL}/api/unit-groups/${editingGroup.id}/`, {
          method: 'PATCH',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch(`${API_URL}/api/unit-groups/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      if (res.ok) {
        fetchData();
        setShowGroupModal(false);
        setEditingGroup(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!confirm('Удалить группу? Все единицы в группе будут также удалены.')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/unit-groups/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      setGroups(groups.filter(g => g.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveUnit = async (formData) => {
    const token = localStorage.getItem('token');
    const data = {};
    formData.forEach((value, key) => {
      if (key === 'group') {
        data[key] = parseInt(value);
      } else if (key === 'is_base' || key === 'is_default' || key === 'is_active') {
        data[key] = value === 'true';
      } else if (key === 'ratio_to_base') {
        data[key] = parseFloat(value) || 1;
      } else if (key === 'sort_order') {
        data[key] = parseInt(value) || 0;
      } else {
        data[key] = value;
      }
    });

    try {
      let res;
      if (editingUnit) {
        res = await fetch(`${API_URL}/api/units/${editingUnit.id}/`, {
          method: 'PATCH',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch(`${API_URL}/api/units/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      if (res.ok) {
        fetchData();
        setShowUnitModal(false);
        setEditingUnit(null);
      } else {
        const err = await res.json();
        alert(err.is_base || err.non_field_errors || 'Ошибка сохранения');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUnit = async (id) => {
    if (!confirm('Удалить единицу измерения?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/units/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      setUnits(units.filter(u => u.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const getUnitsForGroup = (groupId) => units.filter(u => u.group === groupId);

  if (loading) {
    return <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white">
          Единицы измерения
        </h2>
      </div>

      {/* Табы */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('groups')}
          className={`px-4 py-2 rounded-xl font-['Inter'] text-[14px] transition-colors ${
            activeTab === 'groups'
              ? 'bg-[#6d5bd0] text-white'
              : 'bg-white dark:bg-[#25213b] text-[#6e6893] dark:text-[#b8b3d4] border border-[#e8e4ff] dark:border-[#3d3860]'
          }`}
        >
          Группы ({groups.length})
        </button>
        <button
          onClick={() => setActiveTab('units')}
          className={`px-4 py-2 rounded-xl font-['Inter'] text-[14px] transition-colors ${
            activeTab === 'units'
              ? 'bg-[#6d5bd0] text-white'
              : 'bg-white dark:bg-[#25213b] text-[#6e6893] dark:text-[#b8b3d4] border border-[#e8e4ff] dark:border-[#3d3860]'
          }`}
        >
          Все единицы ({units.length})
        </button>
      </div>

      {/* Группы */}
      {activeTab === 'groups' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingGroup(null); setShowGroupModal(true); }}
              className="bg-[#6d5bd0] px-5 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
            >
              + Добавить группу
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
              Нет групп единиц
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groups.map(group => (
                <div
                  key={group.id}
                  className="bg-white dark:bg-[#25213b] rounded-xl p-4 border border-[#e8e4ff] dark:border-[#3d3860]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{group.icon}</span>
                      <div>
                        <p className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white">
                          {group.name}
                        </p>
                        <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4]">
                          /{group.slug} • {group.units_count || 0} единиц
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingGroup(group); setShowGroupModal(true); }}
                        className="text-[#6d5bd0] hover:underline font-['Inter'] text-[14px]"
                      >
                        Ред.
                      </button>
                      <button
                        onClick={() => handleDeleteGroup(group.id)}
                        className="text-red-500 hover:underline font-['Inter'] text-[14px]"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  {group.description && (
                    <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-3">
                      {group.description}
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    {getUnitsForGroup(group.id).slice(0, 5).map(unit => (
                      <span 
                        key={unit.id}
                        className="px-2 py-1 bg-[#f8f7ff] dark:bg-[#2d2847] rounded-lg text-xs font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]"
                      >
                        {unit.short_name}
                        {unit.is_base && <span className="ml-1 text-[#6d5bd0]">★</span>}
                      </span>
                    ))}
                    {getUnitsForGroup(group.id).length > 5 && (
                      <span className="px-2 py-1 text-xs font-['Inter'] text-[#6e6893]">
                        +{getUnitsForGroup(group.id).length - 5}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Единицы */}
      {activeTab === 'units' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingUnit(null); setShowUnitModal(true); }}
              className="bg-[#6d5bd0] px-5 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
            >
              + Добавить единицу
            </button>
          </div>

          {units.length === 0 ? (
            <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
              Нет единиц измерения
            </div>
          ) : (
            <div className="bg-white dark:bg-[#25213b] rounded-xl overflow-hidden border border-[#e8e4ff] dark:border-[#3d3860]">
              <table className="w-full">
                <thead className="bg-[#f8f7ff] dark:bg-[#2d2847]">
                  <tr>
                    <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Название</th>
                    <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Сокращение</th>
                    <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Группа</th>
                    <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Коэффициент</th>
                    <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Тип</th>
                    <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {units.map(unit => (
                    <tr key={unit.id} className="border-t border-[#e8e4ff] dark:border-[#3d3860]">
                      <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white">
                        {unit.name}
                      </td>
                      <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white font-semibold">
                        {unit.short_name}
                      </td>
                      <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#6e6893]">
                        {unit.group_name}
                      </td>
                      <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#6e6893]">
                        {unit.ratio_to_base}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {unit.is_base && (
                            <span className="px-2 py-0.5 bg-[#fef3c7] dark:bg-[#451a03] text-[#b45309] text-xs rounded-full">
                              Базовая
                            </span>
                          )}
                          {unit.is_default && (
                            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full">
                              По умолч.
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => { setEditingUnit(unit); setShowUnitModal(true); }}
                            className="text-[#6d5bd0] hover:underline font-['Inter'] text-[14px]"
                          >
                            Ред.
                          </button>
                          <button
                            onClick={() => handleDeleteUnit(unit.id)}
                            className="text-red-500 hover:underline font-['Inter'] text-[14px]"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Модалка группы */}
      {showGroupModal && (
        <UnitGroupModal
          group={editingGroup}
          onClose={() => { setShowGroupModal(false); setEditingGroup(null); }}
          onSave={handleSaveGroup}
        />
      )}

      {/* Модалка единицы */}
      {showUnitModal && (
        <UnitModal
          unit={editingUnit}
          groups={groups}
          onClose={() => { setShowUnitModal(false); setEditingUnit(null); }}
          onSave={handleSaveUnit}
        />
      )}
    </div>
  );
}

function UnitGroupModal({ group, onClose, onSave }) {
  const [formData] = useState(() => {
    const fd = new FormData();
    if (group) {
      fd.set('name', group.name || '');
      fd.set('slug', group.slug || '');
      fd.set('icon', group.icon || '📏');
      fd.set('description', group.description || '');
      fd.set('sort_order', String(group.sort_order || 0));
      fd.set('is_active', String(group.is_active !== false));
    } else {
      fd.set('sort_order', '0');
      fd.set('is_active', 'true');
    }
    return fd;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const icons = ['📏', '⚖️', '📦', '🌡️', '⏱️', '💡', '🔋', '💧', '🧵', '📐', '📊', '🎯'];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-md p-6">
        <h3 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4">
          {group ? 'Редактировать группу' : 'Новая группа'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Название
            </label>
            <input
              type="text"
              defaultValue={group?.name || ''}
              onChange={e => formData.set('name', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            />
          </div>
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              URL-слаг
            </label>
            <input
              type="text"
              defaultValue={group?.slug || ''}
              onChange={e => formData.set('slug', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            />
          </div>
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Иконка
            </label>
            <div className="flex gap-2 flex-wrap">
              {icons.map(icon => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => formData.set('icon', icon)}
                  className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-colors ${
                    (group?.icon || '📏') === icon
                      ? 'bg-[#6d5bd0] text-white'
                      : 'bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860]'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Описание
            </label>
            <textarea
              defaultValue={group?.description || ''}
              onChange={e => formData.set('description', e.target.value)}
              rows={2}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Сортировка
              </label>
              <input
                type="number"
                defaultValue={group?.sort_order || 0}
                onChange={e => formData.set('sort_order', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              />
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Активна
              </label>
              <select
                defaultValue={group?.is_active !== false ? 'true' : 'false'}
                onChange={e => formData.set('is_active', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              >
                <option value="true">Да</option>
                <option value="false">Нет</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#6d5bd0] py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#f8f7ff] dark:bg-[#2d2847] py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UnitModal({ unit, groups, onClose, onSave }) {
  const [formData] = useState(() => {
    const fd = new FormData();
    if (unit) {
      fd.set('name', unit.name || '');
      fd.set('short_name', unit.short_name || '');
      fd.set('plural_name', unit.plural_name || '');
      fd.set('group', String(unit.group || ''));
      fd.set('ratio_to_base', String(unit.ratio_to_base || 1));
      fd.set('is_base', String(unit.is_base || false));
      fd.set('is_default', String(unit.is_default || false));
      fd.set('sort_order', String(unit.sort_order || 0));
      fd.set('is_active', String(unit.is_active !== false));
    } else {
      fd.set('ratio_to_base', '1');
      fd.set('is_active', 'true');
      fd.set('sort_order', '0');
    }
    return fd;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4">
          {unit ? 'Редактировать единицу' : 'Новая единица'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Название *
            </label>
            <input
              type="text"
              placeholder="Килограмм"
              defaultValue={unit?.name || ''}
              onChange={e => formData.set('name', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Сокращение *
              </label>
              <input
                type="text"
                placeholder="кг"
                defaultValue={unit?.short_name || ''}
                onChange={e => formData.set('short_name', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                required
              />
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Множественное число
              </label>
              <input
                type="text"
                placeholder="Килограммы"
                defaultValue={unit?.plural_name || ''}
                onChange={e => formData.set('plural_name', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              />
            </div>
          </div>
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Группа *
            </label>
            <select
              defaultValue={unit?.group || ''}
              onChange={e => formData.set('group', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            >
              <option value="">Выберите группу</option>
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.icon} {g.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Коэффициент к базовой *
              <span className="text-[11px] ml-2 text-[#8b83ba]">для кг: 1, для г: 0.001</span>
            </label>
            <input
              type="number"
              step="0.000001"
              defaultValue={unit?.ratio_to_base || 1}
              onChange={e => formData.set('ratio_to_base', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Базовая
              </label>
              <select
                defaultValue={unit?.is_base ? 'true' : 'false'}
                onChange={e => formData.set('is_base', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              >
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                По умолч.
              </label>
              <select
                defaultValue={unit?.is_default ? 'true' : 'false'}
                onChange={e => formData.set('is_default', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              >
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Сортировка
              </label>
              <input
                type="number"
                defaultValue={unit?.sort_order || 0}
                onChange={e => formData.set('sort_order', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-[#6d5bd0] py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
            >
              Сохранить
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-[#f8f7ff] dark:bg-[#2d2847] py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
            >
              Отмена
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
