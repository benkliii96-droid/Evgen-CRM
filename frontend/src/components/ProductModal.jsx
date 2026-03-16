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
  const [fieldValues, setFieldValues] = useState({});
  const [categoryFields, setCategoryFields] = useState([]);
  const [fieldsLoading, setFieldsLoading] = useState(false);
  const [availableUnits, setAvailableUnits] = useState([]);
  const [defaultUnitId, setDefaultUnitId] = useState(null);
  const [unitsLoading, setUnitsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const priceNum = parseFloat(formData.price) || 0;
    const qtyNum = parseFloat(formData.quantity) || 0;
    const discNum = formData.hasDiscount ? (parseFloat(formData.discountPercent) || 0) : 0;
    setTotal(priceNum * qtyNum * (1 - discNum / 100));
  }, [formData.price, formData.quantity, formData.discountPercent, formData.hasDiscount]);

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
        setDefaultUnitId(data.default_unit_id || null);
        
        // Устанавливаем единицу по умолчанию, если не выбрана
        if (!formData.unit && data.default_unit_id) {
          setFormData(prev => ({ ...prev, unit: String(data.default_unit_id) }));
        }
      })
      .catch(() => setAvailableUnits([]))
      .finally(() => setUnitsLoading(false));
  }, [formData.category]);

  // Загрузка полей категории
  useEffect(() => {
    const categoryId = formData.category;
    if (!categoryId) {
      setCategoryFields([]);
      return;
    }

    setFieldsLoading(true);
    fetch(`${API_URL}/api/fields/by_category/?category_id=${categoryId}`, {
      headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(fields => {
        setCategoryFields(fields);
        // Инициализируем значения полей
        const initialValues = {};
        fields.forEach(field => {
          if (field.default_value !== undefined && field.default_value !== null) {
            initialValues[field.id] = field.default_value;
          } else if (field.field_type === 'boolean') {
            initialValues[field.id] = false;
          } else if (field.field_type === 'number' || field.field_type === 'decimal') {
            initialValues[field.id] = '';
          } else {
            initialValues[field.id] = '';
          }
        });
        
        // Если есть значения полей товара - перезаписываем
        if (product?.field_values) {
          product.field_values.forEach(fv => {
            initialValues[fv.field.id] = fv.value;
          });
        }
        
        setFieldValues(initialValues);
      })
      .catch(() => setCategoryFields([]))
      .finally(() => setFieldsLoading(false));
  }, [formData.category, product]);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        category: product.category || '',
        unit: product.unit || '',
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
    
    // Добавляем значения полей
    const fieldValuesArray = [];
    categoryFields.forEach(field => {
      const value = fieldValues[field.id];
      if (value !== undefined && value !== '' && value !== null) {
        fieldValuesArray.push({
          field_id: field.id,
          value: value
        });
      }
    });
    
    if (fieldValuesArray.length > 0) {
      fd.append('field_values', JSON.stringify(fieldValuesArray));
    }
    
    onSave(fd);
  };
  
  const handleFieldChange = (fieldId, value) => {
    setFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
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
                  Ед. изм. {unitsLoading && <span className="text-[11px]">(загрузка...)</span>}
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  disabled={unitsLoading}
                  className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] disabled:opacity-50"
                >
                  {availableUnits.length > 0 ? (
                    <>
                      <option value="">Выберите единицу</option>
                      {availableUnits.map(unit => (
                        <option key={unit.id} value={unit.id}>
                          {unit.short_name} {unit.name !== unit.short_name ? `(${unit.name})` : ''}
                          {unit.is_default ? ' ★' : ''}
                        </option>
                      ))}
                    </>
                  ) : (
                    <>
                      <option value="">Не выбрано</option>
                      <option value="1">шт - Штук</option>
                      <option value="2">кг - Килограмм</option>
                      <option value="3">г - Грамм</option>
                      <option value="4">л - Литр</option>
                      <option value="5">м - Метр</option>
                    </>
                  )}
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

            {/* Динамические поля */}
            {fieldsLoading ? (
              <div className="py-2 font-['Inter'] text-[13px] text-[#6e6893]">Загрузка полей...</div>
            ) : categoryFields.length > 0 && (
              <div className="space-y-3 pt-2 border-t border-[#e8e4ff] dark:border-[#3d3860]">
                <p className="font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                  Дополнительные характеристики
                </p>
                {categoryFields.map(field => (
                  <DynamicField 
                    key={field.id} 
                    field={field} 
                    value={fieldValues[field.id]}
                    onChange={(value) => handleFieldChange(field.id, value)}
                  />
                ))}
              </div>
            )}

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

// Компонент для рендеринга динамического поля
function DynamicField({ field, value, onChange }) {
  const { 
    name, slug, field_type, placeholder, description, 
    required, unit, options = {}, min_length, max_length 
  } = field;
  
  const choices = options.choices || [];
  
  const getValue = () => {
    if (value === undefined || value === null) return '';
    if (typeof value === 'object') return value.value ?? '';
    return value;
  };
  
  const renderField = () => {
    switch (field_type) {
      case 'text':
        return (
          <input
            type="text"
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          />
        );
        
      case 'textarea':
        return (
          <textarea
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            rows={3}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl px-3 py-2 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] resize-none"
          />
        );
        
      case 'number':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={getValue()}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              min={options.min}
              max={options.max}
              step={options.step || 1}
              className="flex-1 bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
            {unit && <span className="font-['Inter'] text-[14px] text-[#6e6893]">{unit}</span>}
          </div>
        );
        
      case 'decimal':
        return (
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={getValue()}
              onChange={e => onChange(e.target.value)}
              placeholder={placeholder}
              min={options.min}
              max={options.max}
              step={options.step || 0.01}
              className="flex-1 bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
            {unit && <span className="font-['Inter'] text-[14px] text-[#6e6893]">{unit}</span>}
          </div>
        );
        
      case 'boolean':
        return (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={!!value}
              onChange={e => onChange(e.target.checked)}
              className="w-5 h-5 rounded accent-[#6d5bd0]"
            />
            <span className="font-['Inter'] text-[14px] text-[#25213b] dark:text-white">
              {placeholder || 'Да'}
            </span>
          </label>
        );
        
      case 'select':
        return (
          <select
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          >
            <option value="">Выберите...</option>
            {choices.map((choice, idx) => (
              <option key={idx} value={choice}>
                {typeof choice === 'object' ? choice.label || choice.value : choice}
              </option>
            ))}
          </select>
        );
        
      case 'multiselect':
        const selectedValues = Array.isArray(value) ? value : [];
        return (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {choices.map((choice, idx) => {
                const val = typeof choice === 'object' ? choice.value : choice;
                const isSelected = selectedValues.includes(val);
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      let newValues;
                      if (isSelected) {
                        newValues = selectedValues.filter(v => v !== val);
                      } else {
                        newValues = [...selectedValues, val];
                      }
                      onChange(newValues);
                    }}
                    className={`px-3 py-1.5 rounded-lg font-['Inter'] text-[13px] transition-colors ${
                      isSelected
                        ? 'bg-[#6d5bd0] text-white'
                        : 'bg-[#f8f7ff] dark:bg-[#2d2847] text-[#6e6893] dark:text-[#b8b3d4] border border-[#e8e4ff] dark:border-[#3d3860]'
                    }`}
                  >
                    {typeof choice === 'object' ? choice.label || val : val}
                  </button>
                );
              })}
            </div>
          </div>
        );
        
      case 'date':
        return (
          <input
            type="date"
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          />
        );
        
      case 'datetime':
        return (
          <input
            type="datetime-local"
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          />
        );
        
      case 'email':
        return (
          <input
            type="email"
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'email@example.com'}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          />
        );
        
      case 'phone':
        return (
          <input
            type="tel"
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || '+7 (999) 123-45-67'}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          />
        );
        
      case 'url':
        return (
          <input
            type="url"
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder || 'https://'}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          />
        );
        
      case 'color':
        return (
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={getValue() || '#000000'}
              onChange={e => onChange(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border border-[#e8e4ff] dark:border-[#3d3860]"
            />
            <input
              type="text"
              value={getValue()}
              onChange={e => onChange(e.target.value)}
              placeholder="#000000"
              className="flex-1 bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
          </div>
        );
        
      case 'range':
        const min = options.min || 0;
        const max = options.max || 100;
        const step = options.step || 1;
        const currentValue = parseFloat(getValue()) || min;
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <input
                type="range"
                value={currentValue}
                onChange={e => onChange(e.target.value)}
                min={min}
                max={max}
                step={step}
                className="flex-1 accent-[#6d5bd0]"
              />
              <span className="font-['Inter'] text-[14px] text-[#25213b] dark:text-white min-w-[60px] text-right">
                {currentValue} {unit || ''}
              </span>
            </div>
            <div className="flex justify-between text-[11px] text-[#6e6893]">
              <span>{min}</span>
              <span>{max}</span>
            </div>
          </div>
        );
        
      case 'file':
      case 'image':
        return (
          <div className="flex items-center gap-2">
            <label className="cursor-pointer bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] px-4 rounded-xl flex items-center border border-[#e8e4ff] dark:border-[#3d3860] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]">
              <span className="font-['Inter'] text-[13px] text-[#6e6893]">Выбрать файл</span>
              <input 
                type="file" 
                accept={field_type === 'image' ? 'image/*' : '*'}
                onChange={e => onChange(e.target.files[0]?.name || '')}
                className="hidden" 
              />
            </label>
            {value && (
              <span className="font-['Inter'] text-[13px] text-[#6e6893] truncate max-w-[200px]">
                {value}
              </span>
            )}
          </div>
        );
        
      default:
        return (
          <input
            type="text"
            value={getValue()}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[40px] rounded-xl px-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
          />
        );
    }
  };
  
  return (
    <div>
      <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-1.5">
        {name}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {description && (
        <p className="font-['Inter'] text-[11px] text-[#8b83ba] mb-1">{description}</p>
      )}
      {renderField()}
    </div>
  );
}
