import { useState, useEffect } from 'react';

const API_URL = '';

export function ProductRequestModal({ categories, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    category: categories?.[0]?.id || '',
    unit: 'шт',
    quantity: '',
    price: '',
    hasDiscount: false,
    discountPercent: 0,
    description: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      category: categories?.[0]?.id || ''
    }));
  }, [categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    // Ограничение скидки 0-100%
    if (name === 'discountPercent') {
      const num = parseInt(value) || 0;
      newValue = Math.min(100, Math.max(0, num));
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) {
        setErrors({ ...errors, image: 'Максимальный размер 1МБ' });
        return;
      }
      // Создаем превью
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      
      setFormData(prev => ({ ...prev, image: file }));
      if (errors.image) {
        setErrors({ ...errors, image: null });
      }
    }
  };

  const validate = () => {
    const newErrors = {};
    const { name, category, quantity, price } = formData;

    if (!name || name.length < 2) newErrors.name = 'Наименование обязательно (мин. 2 символа)';
    if (!category) newErrors.category = 'Выберите категорию';
    if (!quantity || parseInt(quantity) < 1) newErrors.quantity = 'Укажите количество';
    if (!price || parseFloat(price) <= 0) newErrors.price = 'Укажите цену';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      setShowError(true);
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Проверяем есть ли изображение
      const hasImage = formData.image instanceof File;
      
      if (hasImage) {
        // Отправляем как FormData
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('category', formData.category);
        fd.append('unit', formData.unit);
        fd.append('quantity', formData.quantity);
        fd.append('price', formData.price);
        fd.append('has_discount', formData.hasDiscount);
        fd.append('discount_percent', formData.discountPercent || 0);
        fd.append('description', formData.description);
        fd.append('image', formData.image);

        const res = await fetch(`${API_URL}/api/requests/products/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}` },
          body: fd
        });
        
        if (!res.ok) {
          throw new Error('Ошибка при отправке');
        }
      } else {
        // Отправляем как JSON
        const data = {
          name: formData.name,
          category: parseInt(formData.category),
          unit: formData.unit,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          has_discount: formData.hasDiscount,
          discount_percent: parseInt(formData.discountPercent) || 0,
          description: formData.description
        };

        const res = await fetch(`${API_URL}/api/requests/products/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify(data)
        });
        
        if (!res.ok) {
          throw new Error('Ошибка при отправке');
        }
      }
      
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const hasDiscount = formData.hasDiscount;

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[360px] p-6 text-center">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-20 h-20 mx-auto mb-4">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
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
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-6">
          <h2 className="font-['Inter'] font-bold text-[20px] md:text-[24px] text-[#25213b] dark:text-white mb-4 md:mb-6">
            Предложить товар
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Наименование *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border outline-none focus:border-[#6d5bd0] ${
                  errors.name ? 'border-red-500' : 'border-[#e8e4ff] dark:border-[#3d3860]'
                }`}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Категория *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border outline-none focus:border-[#6d5bd0] ${
                    errors.category ? 'border-red-500' : 'border-[#e8e4ff] dark:border-[#3d3860]'
                  }`}
                >
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Единица измерения
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                >
                  <option value="шт">Штук</option>
                  <option value="кг">Килограмм</option>
                  <option value="л">Литр</option>
                  <option value="м">Метр</option>
                  <option value="упак">Упаковка</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Количество *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className={`w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border outline-none focus:border-[#6d5bd0] ${
                    errors.quantity ? 'border-red-500' : 'border-[#e8e4ff] dark:border-[#3d3860]'
                  }`}
                />
                {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
              </div>
              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Цена ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className={`w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border outline-none focus:border-[#6d5bd0] ${
                    errors.price ? 'border-red-500' : 'border-[#e8e4ff] dark:border-[#3d3860]'
                  }`}
                />
                {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="hasDiscount"
                    checked={hasDiscount}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="w-6 h-6 rounded-md border-2 border-[#e8e4ff] dark:border-[#3d3860] peer-checked:bg-[#6d5bd0] peer-checked:border-[#6d5bd0] transition-colors flex items-center justify-center">
                    {hasDiscount && (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="font-['Inter'] text-[14px] text-[#25213b] dark:text-white">Есть скидка</span>
              </label>
              
              {hasDiscount && (
                <div className="bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl p-4 border border-[#e8e4ff] dark:border-[#3d3860]">
                  {/* Кнопки быстрого выбора */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[5, 10, 15, 20, 25, 30, 50].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, discountPercent: val }))}
                        className={`px-3 py-1.5 rounded-lg font-['Inter'] text-[13px] transition-colors ${
                          formData.discountPercent === val
                            ? 'bg-[#6d5bd0] text-white'
                            : 'bg-white dark:bg-[#25213b] text-[#6e6893] border border-[#e8e4ff] dark:border-[#3d3860] hover:border-[#6d5bd0]'
                        }`}
                      >
                        -{val}%
                      </button>
                    ))}
                  </div>
                  
                  {/* Ползунок */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-['Inter'] text-[13px] text-[#6e6893]">Скидка: {formData.discountPercent || 0}%</span>
                      <span className="font-['Inter'] font-bold text-[16px] text-[#6d5bd0]">
                        -{(formData.discountPercent || 0)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      name="discountPercent"
                      value={formData.discountPercent || 0}
                      onChange={handleChange}
                      min="1"
                      max="100"
                      className="w-full h-2 bg-[#e8e4ff] dark:bg-[#3d3860] rounded-lg appearance-none cursor-pointer accent-[#6d5bd0]"
                    />
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] resize-none"
              />
            </div>

            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Изображение (макс. 1МБ)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] px-4 rounded-xl flex items-center border border-[#e8e4ff] dark:border-[#3d3860] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]">
                  <span className="font-['Inter'] text-[13px] text-[#6e6893]">Выбрать</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {errors.image && <p className="text-red-500 text-xs">{errors.image}</p>}
                {imagePreview && (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Превью" 
                      className="w-16 h-16 rounded-xl object-cover border-2 border-[#6d5bd0]" 
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData(prev => ({ ...prev, image: null }));
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
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
    </div>
  );
}
