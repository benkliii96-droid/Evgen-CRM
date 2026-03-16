export function ImageModal({ image, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="relative max-w-4xl max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-12 right-0 text-white hover:text-gray-300"
        >
          <img src="/close-white.svg" alt="Закрыть" className="w-8 h-8" />
        </button>
        <img
          src={image}
          alt="Изображение товара"
          className="max-w-full max-h-[80vh] rounded-xl object-contain"
        />
      </div>
    </div>
  );
}
