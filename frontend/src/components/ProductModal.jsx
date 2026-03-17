import { useState, useEffect } from 'react';

const API_URL = '';

export function ProductModal({ product, categories, onClose, onSave, onError }) {
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
  const [availableUnits, setAvailableUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [total, setTotal] = useState(0);

  // Загрузка единиц измерения для категории
  useEffect(() => {
    const categoryId = formData.category;
    if (!categoryId) {
      setAvailableUnits([]);
      return;
    }

    setUnitsLoading(true);
    fetch(`${API_URL}/api/units/by_category/?category_id=${categoryId}`, {
      headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        setAvailableUnits(data.units || []);
        // Устанавливаем единицу по умолчанию
        if (!formData.unit && data.default_unit_id) {
          setFormData(prev => ({ ...prev, unit: String(data.default_unit_id) }));
        }
      })
      .catch(() => setAvailableUnits([]))
      .finally(() => setUnitsLoading(false));
  }, [formData.category]);

  // Расчет итого
  useEffect(() => {
    const priceNum = parseFloat(formData.price) || 0;
    const qtyNum = parseFloat(formData.quantity) || 0;
    const discNum = formData.hasDiscount ? (parseFloat(formData.discountPercent) || 0) : 0;
    setTotal(priceNum * qtyNum * (1 - discNum / 100));
  }, [formData.price, formData.quantity, formData.discountPercent, formData.hasDiscount]);

  // Инициализация при редактировании
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        unit: product.unit?.id?.toString() || product.unit?.toString() || '',
        quantity: product.quantity || '',
        price: product.price || '',
        hasDiscount: product.has_discount || false,
        discountPercent: product.discount_percent || 0,
        description: product.description || ''
      });
      if (product.image) {
        setImagePreview(product.image);
      }
    } else {
      setFormData({
        name: '',
        category: categories?.[0]?.id?.toString() || '',
        unit: '',
        quantity: '',
        price: '',
        hasDiscount: false,
        discountPercent: 0,
        description: ''
      });
      setImagePreview(null);
    }
  }, [product, categories]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = type === 'checkbox' ? checked : value;
    
    if (name === 'discountPercent') {
      const num = parseInt(value) || 0;
      newValue = Math.min(100, Math.max(0, num));
    }
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1048576) {
        onError();
        return;
      }
      const reader = new FileReader();
      reader.onload = (ev) => {
        setImagePreview(ev.target.result);
      };
      reader.readAsDataURL(file);
      setFormData(prev => ({ ...prev, image: file }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { name, category, unit, quantity, price } = formData;
    
    if (!name || name.length < 2 || !category || !unit || !quantity || !price) {
      onError();
      return;
    }

    const fd = new FormData();
    fd.append('name', formData.name);
    fd.append('category', formData.category);
    fd.append('unit', formData.unit);
    fd.append('quantity', formData.quantity);
    fd.append('price', formData.price);
    fd.append('hasDiscount', formData.hasDiscount ? 'true' : 'false');
    fd.append('discountPercent', formData.discountPercent);
    fd.append('description', formData.description);
    if (formData.image) {
      fd.append('image', formData.image);
    }
    
    onSave(fd);
  };
  
  const hasDiscount = formData.hasDiscount;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[600px] max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="font-['Inter'] font-bold text-2xl mb-6 text-[#25213b] dark:text-white">
            {product ? 'Редактировать товар' : 'Добавить товар'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Наименование */}
            <div>
              <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Наименование *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full h-11 rounded-xl px-4 bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] font-['Inter'] text-base text-[#25213b] dark:text-white"
                placeholder="Название товара"
                required
              />
            </div>

            {/* Категория + Единица */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Категория *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-11 rounded-xl px-4 bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] font-['Inter'] text-base text-[#25213b] dark:text-white"
                  required
                >
                  <option value="">Выберите</option>
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Ед. изм. * {unitsLoading && <span className="text-xs">(загрузка...)</span>}
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  disabled={unitsLoading}
                  className="w-full h-11 rounded-xl px-4 bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] font-['Inter'] text-base text-[#25213b] dark:text-white disabled:opacity-50"
                  required
                >
                  {availableUnits.length > 0 ? (
                    availableUnits.map(unit => (
                      <option key={unit.id} value={unit.id}>
                        {unit.name} ({unit.short_name})
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="">Сначала выберите категорию</option>
                      <option value="1">Штука (шт)</option>
                      <option value="2">Килограмм (кг)</option>
                      <option value="3">Литр (л)</option>
                      <option value="4">Метр (м)</option>
                    </>
                  )}
                </select>
              </div>
            </div>

            {/* Количество + Цена */}
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
                  className="w-full h-11 rounded-xl px-4 bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] font-['Inter'] text-base text-[#25213b] dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                  Цена ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="w-full h-11 rounded-xl px-4 bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] font-['Inter'] text-base text-[#25213b] dark:text-white"
                  required
                />
              </div>
            </div>

            {/* Скидка */}
            <div>
              <label className="flex items-center gap-3 p-3 bg-[#f8f7ff]/50 dark:bg-[#2d2847]/50 rounded-xl cursor-pointer border border-[#e8e4ff]/50 dark:border-[#3d3860]/50 hover:border-[#6d5bd0]/50 transition-all">
                <input
                  type="checkbox"
                  name="hasDiscount"
                  checked={formData.hasDiscount}
                  onChange={handleChange}
                  className="sr-only peer"
                />
                <div className="w-5 h-5 rounded border-2 border-[#e8e4ff] dark:border-[#3d3860] peer-checked:bg-[#6d5bd0] peer-checked:border-[#6d5bd0] flex items-center justify-center transition-all">
                  {formData.hasDiscount && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>}
                </div>
                <span className="font-['Inter'] text-base text-[#25213b] dark:text-white">Есть скидка</span>
              </label>
            </div>

            {formData.hasDiscount && (
              <div className="p-4 bg-gradient-to-r from-[#6d5bd0]/5 to-[#5d4bc0]/5 rounded-xl border border-[#6d5bd0]/20">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-['Inter'] text-sm text-[#6e6893] dark:text-[#b8b3d4]">Скидка:</span>
                  <span className="font-bold text-xl text-[#6d5bd0]">-{formData.discountPercent}%</span>
                </div>
                <div className="grid grid-cols-6 gap-2 mb-2">
                  {[5, 10, 15, 20, 25, 30].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, discountPercent: val }))}
                      className={`px-2 py-2 rounded-lg font-['Inter'] text-sm transition-all ${
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

            {/* Описание */}
            <div>
              <label className="block font-['Inter'] font-medium text-sm text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                className="w-full rounded-xl px-4 py-3 bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] resize-vertical font-['Inter'] text-base text-[#25213b] dark:text-white"
                placeholder="Описание товара (необязательно)"
              />
            </div>

            {/* Изображение */}
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
            </div>

            {/* Итого */}
            <div className="p-4 bg-gradient-to-r from-emerald-50/50 to-emerald-100/50 dark:from-emerald-950/30 dark:to-emerald-900/30 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-['Inter'] font-semibold text-lg text-[#25213b] dark:text-white mb-1">Итого</p>
                  <p className="text-sm text-[#6e6893] dark:text-[#b8b3d4]">
                    {formData.quantity || 0} × ${formData.price || 0}
                    {hasDiscount && formData.discountPercent > 0 && ` × ${100 - formData.discountPercent}%`}
                  </p>
                </div>
                <p className="font-['Inter'] font-bold text-2xl text-emerald-600 dark:text-emerald-400">
                  ${total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Кнопки */}
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
                className="flex-1 bg-gradient-to-r from-[#6d5bd0] to-[#5d4bc0] h-12 rounded-xl font-['Inter'] font-semibold text-base text-white shadow-lg hover:shadow-xl hover:from-[#5d4bc0] hover:to-[#4f419b] transition-all"
              >
                Сохранить
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
