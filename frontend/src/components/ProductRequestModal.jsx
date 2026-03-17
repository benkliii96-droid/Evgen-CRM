import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export function ProductRequestModal({ onClose, onError }) {
  const [categories, setCategories] = useState([]);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: '',
    quantity: '',
    price: '',
    hasDiscount: false,
    discountPercent: 0,
    description: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [total, setTotal] = useState(0);

  // Загрузка категорий с units
  useEffect(() => {
    const token = localStorage.getItem('token');
    fetch(`${API_URL}/api/categories/?units=true`, {
      headers: { 'Authorization': `Token ${token}` }
    })
      .then(res => res.json())
      .then(setCategories)
      .catch(err => console.error('Error loading categories:', err))
      .finally(() => setLoading(false));
  }, []);

  // Обновление доступных единиц при смене категории
  useEffect(() => {
    if (formData.category) {
      const selectedCat = categories.find(cat => cat.id == formData.category);
      if (selectedCat && selectedCat.allowed_units) {
        const units = selectedCat.allowed_units.map(cu => cu.unit);
        setAvailableUnits(units);
        // Устанавливаем первую доступную единицу по умолчанию
        if (units.length > 0 && !formData.unit) {
          setFormData(prev => ({ ...prev, unit: units[0].short_name }));
        }
      } else {
        setAvailableUnits([]);
        setFormData(prev => ({ ...prev, unit: '' }));
      }
    }
  }, [formData.category, categories]);

  useEffect(() => {
    const priceNum = parseFloat(formData.price) || 0;
    const qtyNum = parseFloat(formData.quantity) || 0;
    const discNum = formData.hasDiscount ? (parseFloat(formData.discountPercent) || 0) : 0;
    setTotal(priceNum * qtyNum * (1 - discNum / 100));
  }, [formData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    if (name === 'discountPercent') {
      newValue = Math.min(100, Math.max(0, parseInt(value) || 0));
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (e) => {
    handleChange(e);
    // Сбрасываем unit при смене категории
    setFormData(prev => ({ ...prev, unit: '' }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.size > 1048576) {
      setErrors({ image: 'Максимальный размер 1МБ' });
      return;
    }
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => setImagePreview(ev.target.result);
      reader.readAsDataURL(file);
    }
    setFormData(prev => ({ ...prev, image: file || null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Наименование обязательно';
    if (!formData.category) newErrors.category = 'Выберите категорию';
    if (!formData.unit) newErrors.unit = 'Выберите единицу измерения';
    if (!formData.quantity || parseInt(formData.quantity) < 1) newErrors.quantity = 'Количество от 1';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Цена больше 0';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitLoading(true);
    try {
      const token = localStorage.getItem('token');
      const hasImage = formData.image instanceof File;
      
      if (hasImage) {
        const fd = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
          if (key === 'image') {
            if (value) fd.append(key, value);
          } else if (value !== '') {
            fd.append(key, value);
          }
        });
        var res = await fetch(`${API_URL}/api/requests/products/`, {
          method: 'POST',
          headers: { 'Authorization': `Token ${token}` },
          body: fd
        });
      } else {
        const data = {
          name: formData.name.trim(),
          category: parseInt(formData.category),
          unit: formData.unit,
          quantity: parseInt(formData.quantity),
          price: parseFloat(formData.price),
          has_discount: formData.hasDiscount,
          discount_percent: parseInt(formData.discountPercent),
          description: formData.description.trim()
        };
        var res = await fetch(`${API_URL}/api/requests/products/`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Token ${token}`
          },
          body: JSON.stringify(data)
        });
      }
      
      if (!res.ok) throw new Error(await res.text());
      
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error(err);
      onError?.();
    } finally {
      setSubmitLoading(false);
    }
  };

  const hasDiscount = formData.hasDiscount;

  if (loading) {
    return <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#25213b] p-8 rounded-2xl">Загрузка категорий...</div>
    </div>;
  }

  if (success) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
        <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[360px] p-6 text-center">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mx-auto mb-4 w-20 h-20">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <path strokeDasharray="5,5" d="M12 17H9.01"/>
          </svg>
          <h2 className="font-['Inter'] font-bold text-xl mb-2 text-[#25213b] dark:text-white">Заявка отправлена!</h2>
          <p className="text-[#6e6893] dark:text-[#b8b3d4]">Ожидайте одобрения администратора</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto p-6">
        <h2 className="font-['Inter'] font-bold text-2xl mb-6 text-[#25213b] dark:text-white">Предложить товар</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Наименование *
            </label>
            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full h-11 rounded-xl px-4 border outline-none focus:border-[#6d5bd0] transition-colors font-['Inter'] text-base ${
                errors.name 
                  ? 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-500 text-red-900 dark:text-red-100' 
                  : 'bg-[#f8f7ff] dark:bg-[#2d2847] border-[#e8e4ff] dark:border-[#3d3860] text-[#25213b] dark:text-white'
              }`}
              placeholder="Название товара"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Категория *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleCategoryChange}
                className={`w-full h-11 rounded-xl px-4 border outline-none focus:border-[#6d5bd0] font-['Inter'] text-base transition-colors ${
                  errors.category 
                    ? 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-500 text-red-900 dark:text-red-100' 
                    : 'bg-[#f8f7ff] dark:bg-[#2d2847] border-[#e8e4ff] dark:border-[#3d3860] text-[#25213b] dark:text-white'
                }`}
              >
                <option value="">Выберите категорию</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
            </div>

            <div>
              <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Единица измерения *
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                disabled={!availableUnits.length}
                className={`w-full h-11 rounded-xl px-4 border outline-none focus:border-[#6d5bd0] font-['Inter'] text-base transition-colors ${
                  errors.unit 
                    ? 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-500 text-red-900 dark:text-red-100' 
                    : 'bg-[#f8f7ff] dark:bg-[#2d2847] border-[#e8e4ff] dark:border-[#3d3860] text-[#25213b] dark:text-white'
                } ${!availableUnits.length ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {availableUnits.length ? (
                  availableUnits.map(unit => (
                    <option key={unit.id} value={unit.short_name}>
                      {unit.name} ({unit.short_name})
                    </option>
                  ))
                ) : (
                  <option value="">Сначала выберите категорию</option>
                )}
              </select>
              {errors.unit && <p className="text-red-500 text-xs mt-1">{errors.unit}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Количество *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="1"
                className={`w-full h-11 rounded-xl px-4 border outline-none focus:border-[#6d5bd0] font-['Inter'] text-base transition-colors ${
                  errors.quantity 
                    ? 'bg-red-50 border-red-300 dark:bg-red-950/30 dark:border-red-500 text-red-900 dark:text-red-100' 
                    : 'bg-[#f8f7ff] dark:bg-[#2d2847] border-[#e8e4ff] dark:border-[#3d3860] text-[#25213b] dark:text-white'
                }`}
              />
              {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
            </div>
            <div>
              <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Цена ($)*
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0.01"
                step="0.01"
                className={`w-full h-11 rounded-xl px-4 border outline-none focus:border-[#6d5bd0] font-['Inter'] text-base transition-colors ${
                  errors.price 
                    ? 'bg-red-50 border-red-500 dark:bg-red-950/30 dark:border-red-500 text-red-900 dark:text-red-100' 
                    : 'bg-[#f8f7ff] dark:bg-[#2d2847] border-[#e8e4ff] dark:border-[#3d3860] text-[#25213b] dark:text-white'
                }`}
              />
              {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-3 p-3 bg-[#f8f7ff]/50 dark:bg-[#2d2847]/50 rounded-xl cursor-pointer border border-[#e8e4ff]/50 dark:border-[#3d3860]/50 hover:border-[#6d5bd0]/50 transition-all">
              <input
                type="checkbox"
                name="hasDiscount"
                checked={hasDiscount}
                onChange={handleChange}
                className="sr-only peer"
              />
              <div className="w-5 h-5 rounded border-2 border-[#e8e4ff] dark:border-[#3d3860] peer-checked:bg-[#6d5bd0] peer-checked:border-[#6d5bd0] flex items-center justify-center transition-all">
                {hasDiscount && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>}
              </div>
              <span className="font-['Inter'] text-base text-[#25213b] dark:text-white">Есть скидка</span>
            </label>
          </div>

          {hasDiscount && (
            <div className="p-4 bg-gradient-to-r from-[#6d5bd0]/5 to-[#5d4bc0]/5 rounded-xl border border-[#6d5bd0]/20">
              <div className="flex justify-between items-center mb-4">
                <span className="font-['Inter'] text-sm text-[#6e6893] dark:text-[#b8b3d4]">Скидка:</span>
                <span className="font-bold text-xl text-[#6d5bd0]">-{formData.discountPercent}%</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {[5, 10, 15, 20, 25, 30].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, discountPercent: val }))}
                    className={`px-3 py-2 rounded-lg font-['Inter'] text-sm transition-all ${
                      formData.discountPercent === val
                        ? 'bg-[#6d5bd0] text-white shadow-lg shadow-[#6d5bd0]/25' 
                        : 'bg-white/50 dark:bg-[#25213b]/50 text-[#6e6893] border border-[#e8e4ff]/50 dark:border-[#3d3860]/50 hover:border-[#6d5bd0]/50'
                    }`}
                  >
                    {val}%
                  </button>
                ))}
              </div>
              <input
                type="range"
                name="discountPercent"
                value={formData.discountPercent}
                onChange={handleChange}
                min="0"
                max="100"
                className="w-full h-2 bg-gradient-to-r from-[#6d5bd0]/20 to-[#5d4bc0]/20 rounded-full appearance-none cursor-pointer accent-[#6d5bd0]"
              />
            </div>
          )}

          <div>
            <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Описание
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full rounded-xl px-4 py-3 border outline-none focus:border-[#6d5bd0] resize-vertical font-['Inter'] text-base bg-[#f8f7ff] dark:bg-[#2d2847] border-[#e8e4ff] dark:border-[#3d3860] text-[#25213b] dark:text-white"
              placeholder="Описание товара (необязательно)"
            />
          </div>

          <div>
            <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
              Изображение (макс. 1 МБ)
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 h-11 px-4 rounded-xl border border-dashed border-[#e8e4ff] dark:border-[#3d3860] bg-[#f8f7ff]/50 dark:bg-[#2d2847]/50 cursor-pointer hover:border-[#6d5bd0]/50 flex items-center justify-center transition-colors font-['Inter'] text-sm text-[#6e6893] hover:text-[#6d5bd0]">
                {imagePreview ? 'Изменить' : 'Выбрать фото'}
                <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
              </label>
              {imagePreview && (
                <div className="relative group">
                  <img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded-xl border-2 border-[#6d5bd0] shadow-md" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setFormData(prev => ({ ...prev, image: null }));
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>
            {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
          </div>

          <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-['Inter'] font-semibold text-lg text-[#25213b] dark:text-white mb-1">Итого</p>
                <p className="text-sm text-[#6e6893] dark:text-[#b8b3d4]">
                  {formData.quantity || 0} × {formData.unit ? `${formData.unit} × ` : ''}${formData.price || 0}
                  {hasDiscount && formData.discountPercent > 0 && ` × ${100 - formData.discountPercent}%`}
                </p>
              </div>
              <p className="font-['Inter'] font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                ${total.toFixed(2)}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-12 rounded-xl border font-['Inter'] font-semibold text-base border-[#e8e4ff] dark:border-[#3d3860] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={submitLoading || loading}
              className="flex-1 bg-gradient-to-r from-[#6d5bd0] to-[#5d4bc0] h-12 rounded-xl font-['Inter'] font-semibold text-base text-white shadow-lg hover:shadow-xl hover:from-[#5d4bc0] hover:to-[#4f419b] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitLoading ? 'Отправка...' : 'Отправить заявку'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

