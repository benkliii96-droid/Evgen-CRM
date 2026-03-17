import { useState } from 'react';

const API_URL = '';

export function CategoryRequestModal({ onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white dark:bg-[#25213b] rounded-2xl w-full max-w-[420px] p-8 text-center max-h-[70vh] flex flex-col justify-center">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6e6893" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-16 h-16 mx-auto mb-6 opacity-75">
          <path d="M12 2v20M2 12h20"/>
        </svg>
        <h2 className="font-['Inter'] font-bold text-[20px] text-[#25213b] dark:text-white mb-3">
          Добавление категорий отключено
        </h2>
        <p className="font-['Inter'] text-[15px] text-[#6e6893] dark:text-[#b8b3d4] mb-6 leading-relaxed">
          Система содержит 15 стандартных категорий. 
          <br/>
          <span className="font-semibold text-[#6d5bd0]">Администраторы могут добавлять новые через панель управления.</span>
        </p>
        <div className="space-y-1 text-xs text-[#8b83ba] dark:text-[#6e6893] mb-6">
          <p>👤 Только для администраторов</p>
          <p>📱 login: admin / admin123</p>
        </div>
        <button
          onClick={onClose}
          className="w-full h-12 bg-gradient-to-r from-[#6d5bd0] to-[#5d4bc0] rounded-xl font-['Inter'] font-semibold text-base text-white hover:shadow-lg hover:shadow-[#6d5bd0]/25 transition-all"
        >
          Понятно
        </button>
      </div>
    </div>
  );
}
