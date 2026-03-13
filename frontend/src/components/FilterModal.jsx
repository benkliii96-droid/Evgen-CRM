import { useState } from 'react';

export function FilterModal({ filters, categories, minPrice, maxPrice, onClose, onApply }) {
  const [localFilters, setLocalFilters] = useState({
    category: filters.category || '',
    priceMin: filters.priceMin || '',
    priceMax: filters.priceMax || '',
    hasDiscount: filters.hasDiscount || '',
  });

  const handleApply = () => {
    onApply(localFilters);
  };

  const handleReset = () => {
    setLocalFilters({
      category: '',
      priceMin: '',
      priceMax: '',
      hasDiscount: '',
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[420px]">
        <div className="p-4 md:p-6">
          <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4 md:mb-6">
            Фильтры
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Категория
              </label>
              <select
                value={localFilters.category}
                onChange={(e) => setLocalFilters({ ...localFilters, category: e.target.value })}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              >
                <option value="">Все категории</option>
                {categories?.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Цена ($)
              </label>
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={localFilters.priceMin}
                    onChange={(e) => setLocalFilters({ ...localFilters, priceMin: e.target.value })}
                    placeholder={`От ${minPrice || 0}`}
                    className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl pl-4 pr-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  />
                </div>
                <span className="text-[#6e6893]">-</span>
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={localFilters.priceMax}
                    onChange={(e) => setLocalFilters({ ...localFilters, priceMax: e.target.value })}
                    placeholder={`До ${maxPrice || 9999}`}
                    className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl pl-4 pr-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-['Inter'] font-medium text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">
                Скидка
              </label>
              <select
                value={localFilters.hasDiscount}
                onChange={(e) => setLocalFilters({ ...localFilters, hasDiscount: e.target.value })}
                className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl px-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
              >
                <option value="">Все товары</option>
                <option value="true">Со скидкой</option>
                <option value="false">Без скидки</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="flex-1 h-[48px] rounded-xl border border-[#e8e4ff] dark:border-[#3d3860] font-['Inter'] font-semibold text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847]"
            >
              Сбросить
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 bg-[#6d5bd0] h-[48px] rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
            >
              Применить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
