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
            <img src="/edit.svg" alt="Редактировать" className="w-[14px] h-[14px] md:w-[18px] md:h-[18px]" />
          </button>
          {product.image && (
            <button
              onClick={() => onImageClick(product.image)}
              className="p-1.5 md:p-2 hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] rounded-lg transition-all"
              title="Просмотреть фото"
            >
              <img src="/has_image.svg" alt="Просмотреть фото" className="w-[14px] h-[14px] md:w-5 md:h-5" />
            </button>
          )}
          <button
            onClick={() => onDelete(product.id)}
            className="p-1.5 md:p-2 hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d] rounded-lg transition-all"
            title="Удалить"
          >
            <img src="/delete.svg" alt="Удалить" className="w-[14px] h-[14px] md:w-5 md:h-5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
