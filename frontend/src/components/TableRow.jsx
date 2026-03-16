function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatUnit(unit) {
  const units = {
    'шт': 'Штук',
    'кг': 'Килограмм',
    'л': 'Литр',
    'м': 'Метр',
    'упак': 'Упаковка'
  };
  return units[unit] || unit;
}

export function TableRow({ product, onEdit, onDelete, onImageClick }) {
  return (
    <tr className="border-b border-[#f0edf7] dark:border-[#3d3860] hover:bg-[#faf9fc] dark:hover:bg-[#2d2847] transition-colors">
      <td className="px-2 md:px-4 py-3 md:py-4 font-['Inter'] text-[12px] md:text-[14px] text-[#25213b] dark:text-white font-semibold">
        {String(product.id).padStart(3, '0')}
      </td>
      <td className="px-2 md:px-4 py-3 md:py-4 font-['Inter'] text-[12px] md:text-[14px] text-[#25213b] dark:text-white max-w-[150px] truncate">{product.name}</td>
      <td className="px-2 md:px-4 py-3 md:py-4 font-['Inter'] text-[12px] md:text-[14px] text-[#25213b] dark:text-white max-w-[100px] truncate">{capitalize(product.category_name || product.category)}</td>
      <td className="px-2 md:px-4 py-3 md:py-4 font-['Inter'] text-[12px] md:text-[14px] text-[#25213b] dark:text-white">{formatUnit(product.unit)}</td>
      <td className="px-2 md:px-4 py-3 md:py-4 font-['Inter'] text-[12px] md:text-[14px] text-[#25213b] dark:text-white">{product.quantity}</td>
      <td className="px-2 md:px-4 py-3 md:py-4 font-['Inter'] text-[12px] md:text-[14px] text-[#25213b] dark:text-white">${product.price}</td>
      <td className="px-2 md:px-4 py-3 md:py-4 font-['Inter'] text-[12px] md:text-[14px] text-[#25213b] dark:text-white">
        ${product.total?.toFixed(2) || '0.00'}
        {product.has_discount && product.discount_percent > 0 && (
          <span className="ml-1 text-[10px] md:text-xs bg-[#6d5bd0] text-white px-1 md:px-2 py-0.5 rounded-full">
            -{product.discount_percent}%
          </span>
        )}
      </td>
      <td className="px-1 md:px-4 py-2 md:py-4">
        <div className="flex items-center">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 md:p-2 hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] rounded-lg transition-all"
            title="Редактировать"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] md:w-[18px] md:h-[18px] dark:brightness-200 text-[#6e6893] dark:text-[#b8b3d4]">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
          </button>
          {product.image && (
            <button
              onClick={() => onImageClick(product.image)}
              className="p-1.5 md:p-2 hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] rounded-lg transition-all"
              title="Просмотреть фото"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] md:w-5 md:h-5 dark:brightness-200 text-[#6e6893] dark:text-[#b8b3d4]">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
            </svg>
            </button>
          )}
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 md:p-2 hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d] rounded-lg transition-all"
            title="Удалить"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[14px] h-[14px] md:w-5 md:h-5 dark:brightness-200 text-red-500">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </button>
        </div>
      </td>
    </tr>
  );
}
