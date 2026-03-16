import { useState, useEffect } from 'react';

export function ProductModal({ product, categories, onClose, onSave, onError }) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    unit: 'шт',
    quantity: '',
    price: '',
    hasDiscount: false,
    discountPercent: 0,
    description: ''
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [total, setTotal] = useState(0);

useEffect(() => {
    const priceNum = parseFloat(formData.price) || 0;
    const qtyNum = parseFloat(formData.quantity) || 0;
    const discNum = formData.hasDiscount ? (parseFloat(formData.discountPercent) || 0) : 0;
    setTotal(priceNum * qtyNum * (1 - discNum / 100));
  }, [formData.price, formData.quantity, formData.discountPercent, formData.hasDiscount]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        unit: product.unit || 'шт',
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
        category: categories?.[0]?.id || '',
        unit: 'шт',
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
    
    // Ограничение скидки 0-100%
    if (name === 'discountPercent') {
      const num = parseInt(value) || 0;
      newValue = Math.min(100, Math.max(0, num));
    }
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };
      
      // Recalculate total
      const priceNum = parseFloat(updated.price) || 0;
      const qtyNum = parseFloat(updated.quantity) || 0;
      const discNum = parseFloat(updated.discountPercent || updated.hasDiscount ? (updated.discountPercent || 0) : 0) || 0;
      setTotal(priceNum * qtyNum * (1 - discNum / 100));
      
      return updated;
    });
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

  // Показать превью - сначала загруженное, потом из продукта
  const showPreview = imagePreview || (product?.image);

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
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[640px] max-h-[90vh] overflow-y-auto">
        <div className="p-4 md:p-5">
          <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4">
            {product ? 'Редактировать товар' : 'Добавить товар'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
                  Наименование *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  required
                />
              </div>

              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
                  Категория *
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  required
                >
                  {categories?.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
                  Кол-во *
                </label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  required
                />
              </div>
              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
                  Цена ($) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  min="0.01"
                  step="0.01"
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  required
                />
              </div>
              <div>
                <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
                  Ед. изм.
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                >
                  <option value="шт">Штук</option>
                  <option value="кг">Килограмм</option>
                  <option value="л">Литр</option>
                  <option value="м">Метр</option>
                  <option value="упак">Упаковка</option>
                </select>
              </div>
            </div>

            {/* Total */}
            <div className="p-3 bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl border border-[#e8e4ff] dark:border-[#3d3860]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-['Inter'] text-[12px] text-[#6e6893] dark:text-[#b8b3d4]">Итого</p>
                  <p className="font-['Inter'] text-[11px] text-[#8b83ba] dark:text-[#6e6893]">
                    {formData.quantity || 0} × ${formData.price || 0}
                    {hasDiscount && formData.discountPercent > 0 && ` × ${100 - formData.discountPercent}%`}
                  </p>
                </div>
                <p className="font-['Inter'] font-bold text-[22px] text-[#6d5bd0]">
                  ${total.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="hasDiscount"
                checked={hasDiscount}
                onChange={handleChange}
                id="hasDiscount"
                className="w-4 h-4 rounded accent-[#6d5bd0]"
              />
              <label htmlFor="hasDiscount" className="font-['Inter'] text-[13px] text-[#25213b] dark:text-white cursor-pointer">
                Есть скидка
              </label>
              {hasDiscount && (
                <div className="flex items-center gap-2 ml-auto">
                  <input
                    type="number"
                    name="discountPercent"
                    value={formData.discountPercent}
                    onChange={handleChange}
                    min="1"
                    max="100"
                    className="w-16 bg-[#f8f7ff] dark:bg-[#2d2847] h-[32px] rounded-lg px-2 font-['Inter'] text-[13px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  />
                  <span className="font-['Inter'] text-[13px] text-[#6e6893]">%</span>
                </div>
              )}
            </div>

            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
                Описание
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="2"
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl px-3 py-2 font-['Inter'] text-[13px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] resize-none"
              />
            </div>

            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
                Изображение (макс. 1МБ)
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer bg-[#f8f7ff] dark:bg-[#2d2847] h-[36px] px-3 rounded-lg flex items-center border border-[#e8e4ff] dark:border-[#3d3860] hover:bg-[#f4f2ff]">
                  <span className="font-['Inter'] text-[12px] text-[#6e6893]">Выбрать</span>
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
                {showPreview && (
                  <img 
                    src={imagePreview || product?.image} 
                    alt="Preview" 
                    className="w-12 h-12 rounded-lg object-cover border border-[#6d5bd0]" 
                  />
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-[40px] rounded-xl border border-[#e8e4ff] dark:border-[#3d3860] font-['Inter'] font-semibold text-[13px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847]"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="flex-1 bg-[#6d5bd0] h-[40px] rounded-xl font-['Inter'] font-semibold text-[13px] text-white hover:bg-[#5d4bc0]"
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
