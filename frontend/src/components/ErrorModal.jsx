export function ErrorModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[360px] p-6 text-center">
        <img src="/error.svg" alt="Ошибка" className="w-20 h-20 mx-auto mb-4" />
        <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-2">
          Что-то пошло не так
        </h2>
        <p className="font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4] mb-6">
          Проверьте правильность заполненных данных
        </p>
        <button
          onClick={onClose}
          className="w-full bg-[#6d5bd0] h-[48px] rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
        >
          Ок
        </button>
      </div>
    </div>
  );
}
