import { useState, useEffect } from 'react';
import { Link } from '../router';

const API_URL = '';

export function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editingField, setEditingField] = useState(null);
  const [activeTab, setActiveTab] = useState('categories');

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const [catsRes, fieldsRes] = await Promise.all([
        fetch(`${API_URL}/api/categories/`, { headers: { 'Authorization': `Token ${token}` } }),
        fetch(`${API_URL}/api/fields/`, { headers: { 'Authorization': `Token ${token}` } })
      ]);
      setCategories(await catsRes.json());
      setFields(await fieldsRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveCategory = async (formData) => {
    const token = localStorage.getItem('token');
    const data = {};
    formData.forEach((value, key) => {
      if (key === 'parent' && value === '') {
        data[key] = null;
      } else if (key === 'parent') {
        data[key] = parseInt(value);
      } else if (key === 'is_active') {
        data[key] = value === 'true';
      } else if (key === 'sort_order') {
        data[key] = parseInt(value) || 0;
      } else {
        data[key] = value;
      }
    });

    try {
      let res;
      if (editingCategory) {
        res = await fetch(`${API_URL}/api/categories/${editingCategory.id}/`, {
          method: 'PATCH',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch(`${API_URL}/api/categories/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      }

      if (res.ok) {
        fetchData();
        setShowCategoryModal(false);
        setEditingCategory(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm('Удалить категорию?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/categories/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      setCategories(categories.filter(c => c.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveField = async (formData) => {
    const token = localStorage.getItem('token');
    const data = {};
    formData.forEach((value, key) => {
      if (key === 'required' || key === 'is_filterable' || key === 'is_visible') {
        data[key] = value === 'true';
      } else if (key === 'sort_order') {
        data[key] = parseInt(value) || 0;
      } else if (key === 'min_value' || key === 'max_value') {
        data[key] = value ? parseFloat(value) : null;
      } else if (key === 'min_length' || key === 'max_length') {
        data[key] = value ? parseInt(value) : null;
      } else if (key === 'options' && value) {
        try {
          data[key] = JSON.parse(value);
        } catch {
          data[key] = {};
        }
      } else if (key === 'categories') {
        data[key] = Array.from(value).map(v => parseInt(v));
      } else {
        data[key] = value;
      }
    });

    try {
      let res;
      if (editingField) {
        res = await fetch(`${API_URL}/api/fields/${editingField.id}/`, {
          method: 'PATCH',
          headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
      } else {
        res = await fetch(`${API_URL}/api/fields/`, {
          method: 'POST',
      headers: { 'Authorization': `Token ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
        });
      }

      if (res.ok) {
        fetchData();
        setShowFieldModal(false);
        setEditingField(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteField = async (id) => {
    if (!confirm('Удалить поле?')) return;
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/fields/${id}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      setFields(fields.filter(f => f.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const fieldTypeLabels = {
    text: 'Текст',
    textarea: 'Текст (многострочный)',
    number: 'Число',
    decimal: 'Десятичное число',
    boolean: 'Да/Нет',
    select: 'Выбор из списка',
    multiselect: 'Множественный выбор',
    date: 'Дата',
    datetime: 'Дата и время',
    image: 'Изображение',
    file: 'Файл',
    url: 'Ссылка',
    email: 'Email',
    phone: 'Телефон',
    color: 'Цвет',
    range: 'Диапазон',
  };

  if (loading) {
    return <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white">
          Категории и поля
        </h2>
      </div>

      {/* Табы */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl font-['Inter'] text-[14px] transition-colors ${
            activeTab === 'categories'
              ? 'bg-[#6d5bd0] text-white'
              : 'bg-white dark:bg-[#25213b] text-[#6e6893] dark:text-[#b8b3d4] border border-[#e8e4ff] dark:border-[#3d3860]'
          }`}
        >
          Категории ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('fields')}
          className={`px-4 py-2 rounded-xl font-['Inter'] text-[14px] transition-colors ${
            activeTab === 'fields'
              ? 'bg-[#6d5bd0] text-white'
              : 'bg-white dark:bg-[#25213b] text-[#6e6893] dark:text-[#b8b3d4] border border-[#e8e4ff] dark:border-[#3d3860]'
          }`}
        >
          Поля товаров ({fields.length})
        </button>
      </div>

      {/* Категории */}
      {activeTab === 'categories' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingCategory(null); setShowCategoryModal(true); }}
              className="bg-[#6d5bd0] px-5 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
            >
              + Добавить категорию
            </button>
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
                        {cat.sort_order || 0}
                      </span>
                    </div>
                    <div>
                      <p className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white">
                        {cat.name}
                      </p>
                      <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4]">
                        /{cat.slug} • {cat.products_count || 0} товаров
                        {cat.parent && ` • родитель: ${cat.parent.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-['Inter'] ${
                      cat.is_active !== false
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {cat.is_active !== false ? 'Активна' : 'Неактивна'}
                    </span>
                    <button
                      onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}
                      className="text-[#6d5bd0] hover:underline font-['Inter'] text-[14px]"
                    >
                      Ред.
                    </button>
                    <button
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-red-500 hover:underline font-['Inter'] text-[14px]"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Поля */}
      {activeTab === 'fields' && (
        <div>
          <div className="flex justify-end mb-4">
            <button
              onClick={() => { setEditingField(null); setShowFieldModal(true); }}
              className="bg-[#6d5bd0] px-5 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
            >
              + Добавить поле
            </button>
          </div>

          {fields.length === 0 ? (
            <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
              Нет полей
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fields.map(field => (
                <div
                  key={field.id}
                  className="bg-white dark:bg-[#25213b] rounded-xl p-4 border border-[#e8e4ff] dark:border-[#3d3860]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white">
                        {field.name}
                      </p>
                      <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4]">
                        {field.slug} • {fieldTypeLabels[field.field_type] || field.field_type}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setEditingField(field); setShowFieldModal(true); }}
                        className="text-[#6d5bd0] hover:underline font-['Inter'] text-[14px]"
                      >
                        Ред.
                      </button>
                      <button
                        onClick={() => handleDeleteField(field.id)}
                        className="text-red-500 hover:underline font-['Inter'] text-[14px]"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {field.required && (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-['Inter']">
                        Обязательно
                      </span>
                    )}
                    {field.is_filterable && (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-xs font-['Inter']">
                        Фильтр
                      </span>
                    )}
                    {field.is_visible && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-['Inter']">
                        Видимо
                      </span>
                    )}
                    {field.unit && (
                      <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-xs font-['Inter']">
                        {field.unit}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Модалка категории */}
      {showCategoryModal && (
        <CategoryModal
          category={editingCategory}
          categories={categories}
          onClose={() => { setShowCategoryModal(false); setEditingCategory(null); }}
          onSave={handleSaveCategory}
        />
      )}

      {/* Модалка поля */}
      {showFieldModal && (
        <FieldModal
          field={editingField}
          categories={categories}
          onClose={() => { setShowFieldModal(false); setEditingField(null); }}
          onSave={handleSaveField}
        />
      )}
    </div>
  );
}

function CategoryModal({ category, categories, onClose, onSave }) {
  const [formData] = useState(() => {
    const fd = new FormData();
    if (category) {
      fd.set('name', category.name || '');
      fd.set('slug', category.slug || '');
      fd.set('parent', category.parent?.id || '');
      fd.set('description', category.description || '');
      fd.set('is_active', String(category.is_active !== false));
      fd.set('sort_order', String(category.sort_order || 0));
    }
    return fd;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-md p-6">
        <h3 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4">
          {category ? 'Редактировать категорию' : 'Новая категория'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Название
            </label>
            <input
              type="text"
              defaultValue={category?.name || ''}
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
              defaultValue={category?.slug || ''}
              onChange={e => formData.set('slug', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              required
            />
          </div>
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Родительская категория
            </label>
            <select
              defaultValue={category?.parent?.id || ''}
              onChange={e => formData.set('parent', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            >
              <option value="">Нет</option>
              {categories.filter(c => c.id !== category?.id).map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Описание
            </label>
            <textarea
              defaultValue={category?.description || ''}
              onChange={e => formData.set('description', e.target.value)}
              rows={3}
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
                defaultValue={category?.sort_order || 0}
                onChange={e => formData.set('sort_order', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              />
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Активна
              </label>
              <select
                defaultValue={category?.is_active !== false ? 'true' : 'false'}
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

function FieldModal({ field, categories, onClose, onSave }) {
  const fieldTypes = [
    { value: 'text', label: 'Текст (однострочный)' },
    { value: 'textarea', label: 'Текст (многострочный)' },
    { value: 'number', label: 'Число' },
    { value: 'decimal', label: 'Десятичное число' },
    { value: 'boolean', label: 'Да/Нет (checkbox)' },
    { value: 'select', label: 'Выбор из списка' },
    { value: 'multiselect', label: 'Множественный выбор' },
    { value: 'date', label: 'Дата' },
    { value: 'datetime', label: 'Дата и время' },
    { value: 'image', label: 'Изображение' },
    { value: 'file', label: 'Файл' },
    { value: 'url', label: 'Ссылка' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Телефон' },
    { value: 'color', label: 'Цвет' },
    { value: 'range', label: 'Диапазон' },
  ];

  const [formData] = useState(() => {
    const fd = new FormData();
    if (field) {
      fd.set('name', field.name || '');
      fd.set('slug', field.slug || '');
      fd.set('field_type', field.field_type || 'text');
      fd.set('description', field.description || '');
      fd.set('placeholder', field.placeholder || '');
      fd.set('options', field.options ? JSON.stringify(field.options, null, 2) : '');
      fd.set('required', String(field.required || false));
      fd.set('is_filterable', String(field.is_filterable || false));
      fd.set('is_visible', String(field.is_visible !== false));
      fd.set('unit', field.unit || '');
      fd.set('sort_order', String(field.sort_order || 0));
      fd.set('min_value', field.min_value || '');
      fd.set('max_value', field.max_value || '');
      fd.set('min_length', field.min_length || '');
      fd.set('max_length', field.max_length || '');
      fd.set('pattern', field.pattern || '');
      // categories
      if (field.categories && field.categories.length > 0) {
        field.categories.forEach(c => fd.append('categories', c.id));
      }
    }
    return fd;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h3 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4">
          {field ? 'Редактировать поле' : 'Новое поле'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Название
              </label>
              <input
                type="text"
                defaultValue={field?.name || ''}
                onChange={e => formData.set('name', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                required
              />
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Идентификатор (slug)
              </label>
              <input
                type="text"
                defaultValue={field?.slug || ''}
                onChange={e => formData.set('slug', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Тип поля
            </label>
            <select
              defaultValue={field?.field_type || 'text'}
              onChange={e => formData.set('field_type', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            >
              {fieldTypes.map(ft => (
                <option key={ft.value} value={ft.value}>{ft.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Подсказка (placeholder)
            </label>
            <input
              type="text"
              defaultValue={field?.placeholder || ''}
              onChange={e => formData.set('placeholder', e.target.value)}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
          </div>

          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Описание
            </label>
            <textarea
              defaultValue={field?.description || ''}
              onChange={e => formData.set('description', e.target.value)}
              rows={2}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
          </div>

          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Параметры (JSON)
              <span className="text-[11px] ml-2 text-[#6e6893]">для select: {"{ \"choices\": [\"A\", \"B\"] }"}</span>
            </label>
            <textarea
              defaultValue={field?.options ? JSON.stringify(field.options, null, 2) : ''}
              onChange={e => formData.set('options', e.target.value)}
              rows={3}
              placeholder='{"choices": ["Вариант 1", "Вариант 2"]}'
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
          </div>

          <div>
            <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Категории
            </label>
            <select
              multiple
              defaultValue={field?.categories?.map(c => c.id) || []}
              onChange={e => {
                formData.delete('categories');
                Array.from(e.target.selectedOptions).forEach(opt => {
                  formData.append('categories', opt.value);
                });
              }}
              className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] h-24"
            >
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Сортировка
              </label>
              <input
                type="number"
                defaultValue={field?.sort_order || 0}
                onChange={e => formData.set('sort_order', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              />
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Единица
              </label>
              <input
                type="text"
                defaultValue={field?.unit || ''}
                onChange={e => formData.set('unit', e.target.value)}
                placeholder="шт, кг, м..."
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              />
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Мин. длина
              </label>
              <input
                type="number"
                defaultValue={field?.min_length || ''}
                onChange={e => formData.set('min_length', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Обязательно
              </label>
              <select
                defaultValue={field?.required ? 'true' : 'false'}
                onChange={e => formData.set('required', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              >
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                В фильтре
              </label>
              <select
                defaultValue={field?.is_filterable ? 'true' : 'false'}
                onChange={e => formData.set('is_filterable', e.target.value)}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-11 rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              >
                <option value="false">Нет</option>
                <option value="true">Да</option>
              </select>
            </div>
            <div>
              <label className="block font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Видимо
              </label>
              <select
                defaultValue={field?.is_visible !== false ? 'true' : 'false'}
                onChange={e => formData.set('is_visible', e.target.value)}
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
