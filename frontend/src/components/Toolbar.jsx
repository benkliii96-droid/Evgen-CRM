export function Toolbar({ searchQuery, onSearchChange, onFilterClick, onAddClick }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={onFilterClick}
        className="flex items-center gap-2 px-4 py-3 bg-[#f8f7ff] dark:bg-[#2d2847] rounded-xl hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] transition-all border border-[#e8e4ff] dark:border-[#3d3860]"
      >
        <img src="/Filter.svg" alt="Фильтр" className="w-5 h-5" />
        <span className="font-['Inter'] font-semibold text-[12px] md:text-[13px] text-[#6e6893] dark:text-[#b8b3d4] uppercase">Фильтр</span>
      </button>

      <div className="relative flex-1 min-w-[200px] max-w-[320px]">
        <img src="/Search.svg" alt="Поиск" className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-60" />
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
