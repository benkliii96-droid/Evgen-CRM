export function ConfirmModal({ onConfirm, onCancel, message = 'Вы уверены?' }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[360px] p-6 text-center">
        <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-4">
          Подтверждение
        </h2>
        <p className="font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] mb-6">
          {message}
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-[48px] rounded-xl border border-[#e8e4ff] dark:border-[#3d3860] font-['Inter'] font-semibold text-[14px] text-[#6e6893] dark:text-[#b8b3d4] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847]"
          >
            Отмена
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-500 h-[48px] rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-red-600"
          >
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
}
