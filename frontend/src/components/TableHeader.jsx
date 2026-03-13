function SortIcon({ direction }) {
  if (!direction) return <span className="ml-0.5 text-[#b8b3d4] text-[10px]">↕</span>;
  return <span className="ml-0.5 text-[#6d5bd0] font-bold text-[10px]">{direction === 'asc' ? '↑' : '↓'}</span>;
}

export function TableHeader({ sortConfig, onSort }) {
  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Наим.' },
    { key: 'category', label: 'Кат.' },
    { key: 'unit', label: 'Ед.' },
    { key: 'quantity', label: 'Кол.' },
    { key: 'price', label: 'Цена' },
    { key: 'total', label: 'Итог' },
  ];

  return (
    <thead>
      <tr className="bg-[#f4f2ff] dark:bg-[#2d2847] border-b border-[#e8e4ff] dark:border-[#3d3860]">
        {columns.map(({ key, label }) => (
          <th
            key={key}
            onClick={() => onSort(key)}
            className="px-2 md:px-4 py-3 md:py-4 text-left font-['Inter'] font-medium text-[11px] md:text-[14px] text-[#8b83ba] cursor-pointer hover:bg-[#ebe6fa] dark:hover:bg-[#3d3860] transition-colors select-none"
          >
            <span className="flex items-center">
              {label}
              <SortIcon direction={sortConfig.key === key ? sortConfig.direction : null} />
            </span>
          </th>
        ))}
        <th className="px-1 md:px-4 py-3 md:py-4 w-[80px] md:w-[130px]"></th>
      </tr>
    </thead>
  );
}
