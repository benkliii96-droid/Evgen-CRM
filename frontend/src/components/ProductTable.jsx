import { TableRow } from './TableRow';

export function ProductTable({ products, sortConfig, onSort, onEdit, onDelete, onImageClick }) {
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) {
      return '/sort.svg';
    }
    return sortConfig.direction === 'asc' ? '/sort-asc.svg' : '/sort-desc.svg';
  };

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Название' },
    { key: 'category_name', label: 'Категория' },
    { key: 'unit', label: 'Ед.изм' },
    { key: 'quantity', label: 'Кол-во' },
    { key: 'price', label: 'Цена' },
    { key: 'total', label: 'Сумма' }
  ];

  return (
    <div className="overflow-x-auto mt-4">
      <table className="w-full min-w-[700px]">
        <thead>
          <tr className="border-b border-[#e8e4ff] dark:border-[#3d3860]">
            {columns.map(col => (
              <th
                key={col.key}
                onClick={() => onSort(col.key)}
                className="px-2 md:px-4 py-3 md:py-4 text-left font-['Inter'] font-semibold text-[11px] md:text-[12px] text-[#6e6893] dark:text-[#b8b3d4] uppercase tracking-wider cursor-pointer hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] transition-colors"
              >
                <div className="flex items-center gap-1 md:gap-2">
                  <span>{col.label}</span>
                  <img src={getSortIcon(col.key)} alt="Сортировка" className="w-3 h-3 md:w-4 md:h-4 opacity-50" />
                </div>
              </th>
            ))}
            <th className="px-2 md:px-4 py-3 md:py-4 text-left font-['Inter'] font-semibold text-[11px] md:text-[12px] text-[#6e6893] dark:text-[#b8b3d4] uppercase tracking-wider">
              Действия
            </th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr>
              <td colSpan="8" className="px-4 py-8 text-center font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
                Нет данных
              </td>
            </tr>
          ) : (
            products.map(product => (
              <TableRow
                key={product.id}
                product={product}
                onEdit={onEdit}
                onDelete={onDelete}
                onImageClick={onImageClick}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
