export function Pagination({ 
  currentPage, 
  totalPages, 
  itemsPerPage, 
  totalItems, 
  onPageChange, 
  onItemsPerPageChange 
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = window.innerWidth < 640 ? 3 : 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 1) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-4 px-2 md:px-6 py-4 border-t border-[#f0edf7] dark:border-[#3d3860]">
      <div className="flex items-center gap-2 order-1">
        <select 
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(e.target.value)}
          className="bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] rounded-lg px-2 py-1.5 font-['Inter'] text-[12px] sm:text-[13px] text-[#25213b] dark:text-white outline-none cursor-pointer hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] transition-colors"
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="20">20</option>
          <option value="50">50</option>
        </select>
      </div>

      <div className="flex items-center gap-1 order-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-[#e8e4ff] dark:border-[#3d3860]"
        >
          &#8249;
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() => typeof page === 'number' && onPageChange(page)}
            disabled={page === '...'}
            className={`min-w-[32px] sm:min-w-[36px] h-8 sm:h-9 rounded-lg font-['Inter'] text-[12px] sm:text-[13px] transition-all border ${
              page === currentPage 
                ? 'bg-[#6d5bd0] text-white border-[#6d5bd0]' 
                : page === '...' 
                  ? 'text-[#6e6893] dark:text-[#b8b3d4] cursor-default bg-transparent border-transparent' 
                  : 'text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] border-[#e8e4ff] dark:border-[#3d3860]'
            }`}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] disabled:opacity-40 disabled:cursor-not-allowed transition-colors border border-[#e8e4ff] dark:border-[#3d3860]"
        >
          &#8250;
        </button>
      </div>

      <span className="font-['Inter'] text-[12px] sm:text-[13px] text-[#6e6893] dark:text-[#b8b3d4] order-3 ml-auto sm:ml-0">
        {startItem}-{endItem} из {totalItems}
      </span>
    </div>
  );
}
