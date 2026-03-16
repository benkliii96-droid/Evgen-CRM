import { TableRow } from './TableRow';

const SortIcon = ({ direction, active }) => {
  if (!active) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 md:w-4 md:h-4 opacity-30">
        <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="18" x2="20" y2="18"/>
      </svg>
    );
  }
  if (direction === 'asc') {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 md:w-4 md:h-4">
        <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3 md:w-4 md:h-4">
      <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
    </svg>
  );
};

export function ProductTable({ products, sortConfig, onSort, onEdit, onDelete, onImageClick }) {

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
                  <SortIcon direction={sortConfig.direction} active={sortConfig.key === col.key} />
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
