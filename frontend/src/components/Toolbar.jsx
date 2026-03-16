export function Toolbar({ searchQuery, onSearchChange, onFilterClick, onAddClick }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onFilterClick}
        className="flex items-center gap-2 px-4 py-3 bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] transition-all border border-[#e8e4ff] dark:border-[#3d3860]"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 dark:brightness-200 text-[#6e6893]">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
        </svg>
        <span className="font-['Inter'] font-semibold text-[12px] md:text-[13px] text-[#6e6893] dark:text-[#b8b3d4] uppercase">Фильтр</span>
      </button>

      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60 dark:brightness-200 text-[#6e6893]">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Поиск..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-[#f8f7ff] dark:bg-[#2d2847] h-[44px] md:h-[48px] rounded-xl pl-12 pr-4 text-[#25213b] dark:text-white font-['Inter'] text-[13px] md:text-[14px] outline-none border border-[#e8e4ff] dark:border-[#3d3860] focus:border-[#6d5bd0] transition-all placeholder:text-[#c6c2de] dark:placeholder:text-[#6e6893]"
        />
      </div>

      <button
        onClick={onAddClick}
        className="bg-[#6d5bd0] h-[44px] md:h-[48px] px-5 md:px-8 rounded-xl font-['Inter'] font-semibold text-[12px] md:text-[13px] text-white uppercase hover:bg-[#5d4bc0] transition-all ml-auto"
      >
        + Добавить
      </button>
    </div>
  )
}
