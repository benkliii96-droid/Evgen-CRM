import { useState, useEffect, useMemo, useRef } from 'react';
import { Router, useLocation, useNavigate, Link } from './router';
import { Header } from './components/Header';
import { Toolbar } from './components/Toolbar';
import { ProductTable } from './components/ProductTable';
import { Pagination } from './components/Pagination';
import { ProductModal } from './components/ProductModal';
import { FilterModal } from './components/FilterModal';
import { ErrorModal } from './components/ErrorModal';
import { ImageModal } from './components/ImageModal';
import { ConfirmModal } from './components/ConfirmModal';
import { LoginModal } from './components/LoginModal';
import { ProductRequestModal } from './components/ProductRequestModal';
import { CategoryRequestModal } from './components/CategoryRequestModal';
import { ProductDetail } from './components/ProductDetail';
import { NotificationsPanel } from './components/NotificationsPanel';
import { Profile } from './components/Profile';
import { AdminLayout, AdminDashboard } from './components/AdminLayout';
import { AdminUsers } from './components/AdminUsers';
import { AdminProducts } from './components/AdminProducts';
import { AdminRequests } from './components/AdminRequests';
import { AdminCategories } from './components/AdminCategories';

const API_URL = ''; // Пустой = относительный URL, работает и для HTTP и для HTTPS

// Компонент-обёртка для профиля с управлением темой и данными пользователя
function ProfileWrapper({ viewUserId }) {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    if (isDark !== darkMode) {
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    // Если это чужой профиль - не нужно загружать свои данные
    if (viewUserId) {
      const token = localStorage.getItem('token');
      if (token) {
        fetch(`${API_URL}/api/auth/me/`, {
          headers: { 'Authorization': `Token ${token}` }
        })
          .then(res => res.ok ? res.json() : Promise.reject())
          .then(data => setUser(data))
          .catch(() => {});
      }
      return;
    }
    
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/me/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          window.location.href = '/';
        });
    } else {
      window.location.href = '/';
    }
  }, [viewUserId]);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('token');
    window.location.href = '/';
  };

  if (!viewUserId && !user) {
    return (
      <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] flex items-center justify-center">
        <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>
      </div>
    );
  }

  return (
    <Profile
      darkMode={darkMode}
      setDarkMode={setDarkMode}
      user={user}
      onLogout={handleLogout}
      viewUserId={viewUserId}
    />
  );
}

function UserCatalog({ products, categories, darkMode, setDarkMode, user, onLogout, onLoginClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryRequest, setShowCategoryRequest] = useState(false);
  const [showProductRequest, setShowProductRequest] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
const [unreadCount, setUnreadCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(12);
  const loaderRef = useRef(null);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || p.category_name === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Сброс количества видимых товаров при изменении фильтров
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory, products]);

  const visibleProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const hasMore = visibleCount < filteredProducts.length;

  // Lazy loading при скролле
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setVisibleCount(prev => prev + 12);
        }
      },
      { threshold: 0.1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] transition-colors">
      <header className="bg-white dark:bg-[#25213b] shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <h1 className="font-['Inter'] font-bold text-[18px] sm:text-[20px] md:text-[24px] text-[#25213b] dark:text-white whitespace-nowrap">
            Каталог товаров
          </h1>
          <div className="flex items-center gap-2 sm:gap-3">
            {user ? (
              <>
                <Link
                  to="/profile/"
                  className="flex items-center gap-2 text-[#6e6893] dark:text-[#b8b3d4] hover:text-[#6d5bd0] dark:hover:text-[#6d5bd0] transition-colors"
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt="Аватар" className="w-8 h-8 rounded-full object-cover" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#f8f7ff] dark:bg-[#2d2847] flex items-center justify-center">
                      <svg className="w-4 h-4 text-[#6e6893] dark:text-[#b8b3d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  )}
                </Link>
                <span className="hidden sm:inline font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4]">{user.username}</span>
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(true)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
                  >
                    <img src="/bell.svg" alt="Уведомления" className="w-4 h-4 sm:w-5 sm:h-5 dark:brightness-200" />
                  </button>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
                >
                  {darkMode ? (
                    <img src="/sun.svg" alt="Солнце" className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <img src="/moon.svg" alt="Луна" className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
                <button
                  onClick={onLogout}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d]"
                  title="Выйти"
                >
                  <img src="/logout.svg" alt="Выйти" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </>
            ) : (
              <button
                onClick={onLoginClick}
                className="bg-[#6d5bd0] px-3 sm:px-5 py-2 rounded-xl font-['Inter'] font-semibold text-[13px] sm:text-[14px] text-white hover:bg-[#5d4bc0]"
              >
                Войти
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="relative flex-1 min-w-0">
            <img src="/Search.svg" alt="Поиск" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white dark:bg-[#25213b] h-11 sm:h-12 rounded-xl pl-10 sm:pl-12 pr-3 sm:pr-4 font-['Inter'] text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0]"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-white dark:bg-[#25213b] h-11 sm:h-12 rounded-xl px-3 sm:px-4 font-['Inter'] text-[13px] sm:text-[14px] text-[#25213b] dark:text-white border border-[#e8e4ff] dark:border-[#3d3860] outline-none focus:border-[#6d5bd0] min-w-[140px]"
          >
            <option value="">Все</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.name}>{cat.name.charAt(0).toUpperCase() + cat.name.slice(1)}</option>
            ))}
          </select>
          {user && (
            <button
              onClick={() => setShowProductRequest(true)}
              className="bg-[#6d5bd0] h-11 sm:h-12 px-3 sm:px-5 rounded-xl font-['Inter'] font-medium text-[12px] sm:text-[14px] text-white hover:bg-[#5d4bc0] whitespace-nowrap"
            >
              + Товар
            </button>
          )}
        </div>

        {filteredProducts.length === 0 ? (
          <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
            Товары не найдены
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {visibleProducts.map(product => (
              <Link 
                to={`/product/${product.id}/`} 
                key={product.id} 
                className="bg-white dark:bg-[#25213b] rounded-2xl overflow-hidden shadow-sm border border-[#e8e4ff] dark:border-[#3d3860] hover:shadow-md hover:border-[#6d5bd0] dark:hover:border-[#6d5bd0] transition-all cursor-pointer group"
              >
                <div className="h-48 bg-[#f8f7ff] dark:bg-[#2d2847] flex items-center justify-center overflow-hidden">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  ) : (
                    <img src="/nothas_image.svg" alt="Нет изображения" className="w-16 h-16 opacity-50 text-[#6e6893]" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white mb-1">{product.name}</h3>
                  <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">{product.category_name}</p>
                  {product.user_username && (
                    <Link 
                      to={`/user/${product.user}/`}
                      className="flex items-center gap-2 mb-2 hover:opacity-80 transition-opacity"
                    >
                      {product.user_avatar ? (
                        <img src={product.user_avatar} alt="" className="w-5 h-5 rounded-full object-cover" />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-[#e8e4ff] dark:bg-[#3d3860] flex items-center justify-center">
                          <svg className="w-3 h-3 text-[#6e6893] dark:text-[#b8b3d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      )}
                      <span className="font-['Inter'] text-[12px] text-[#8b83ba] dark:text-[#6e6893]">
                        {product.user_username}
                      </span>
                    </Link>
                  )}
                  <div className="flex items-center justify-between mb-2">
                    {product.has_discount && product.discount_percent > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="font-['Inter'] font-bold text-[24px] text-[#6d5bd0]">
                            ${(parseFloat(product.price) * (1 - product.discount_percent / 100)).toFixed(2)}
                          </span>
                          <span className="font-['Inter'] text-[14px] text-[#6e6893] line-through">
                            ${product.price}
                          </span>
                        </div>
                        <span className="bg-[#6d5bd0] text-white text-xs px-2 py-1 rounded-full">
                          -{product.discount_percent}%
                        </span>
                      </>
                    ) : (
                      <span className="font-['Inter'] font-bold text-[20px] text-[#6d5bd0]">${product.price}</span>
                    )}
                  </div>
                  <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4]">
                    В наличии: {product.quantity} {product.unit_display}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Lazy loading loader */}
        {hasMore && (
          <div 
            ref={loaderRef}
            className="flex justify-center py-8"
          >
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-[#6d5bd0] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-[#6d5bd0] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-[#6d5bd0] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        )}

      </div>

      {showCategoryRequest && user && (
        <CategoryRequestModal 
          onClose={() => setShowCategoryRequest(false)} 
        />
      )}

      {showProductRequest && user && (
        <ProductRequestModal 
          categories={categories}
          onClose={() => setShowProductRequest(false)} 
          onError={() => setIsErrorModalOpen(true)}
        />
      )}

      {isErrorModalOpen && (
        <ErrorModal onClose={() => setIsErrorModalOpen(false)} />
      )}

      {showNotifications && (
        <NotificationsPanel 
          darkMode={darkMode}
          onClose={() => setShowNotifications(false)}
          user={user}
        />
      )}
    </div>
  );
}

function AdminPage() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [stats, setStats] = useState(null);

  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [filters, setFilters] = useState({ category: '', priceMin: '', priceMax: '', hasDiscount: '' });
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/me/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products/`),
        fetch(`${API_URL}/api/categories/`)
      ]);
      setProducts(await productsRes.json());
      setCategories(await categoriesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Синхронизация темы при монтировании
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    const isDark = saved === 'dark';
    if (isDark !== darkMode) {
      setDarkMode(isDark);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/me/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem('token');
          navigate('/');
        });
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('token');
    // Полный переход на главную страницу с перезагрузкой
    window.location.href = '/';
  };

  useEffect(() => {
    if (user?.is_admin || user?.role === 'admin') {
      fetch(`${API_URL}/api/products/stats/`, {
        headers: { 'Authorization': `Token ${localStorage.getItem('token')}` }
      })
        .then(res => res.ok ? res.json() : {})
        .then(data => setStats(data))
        .catch(() => {});
    }
  }, [user]);

  if (!user) return <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] p-6 font-['Inter'] text-[#6e6893]">Загрузка...</div>;

  const isAdmin = user.is_admin || user.role === 'admin';

  // Определяем текущую страницу на основе URL
  const getCurrentPage = () => {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] p-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white mb-4">Доступ запрещён</h1>
            <p className="font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4] mb-4">У вас нет прав администратора</p>
            <Link to="/" className="text-[#6d5bd0] hover:underline font-['Inter']">Вернуться</Link>
          </div>
        </div>
      );
    }

    // Убираем /admin/ префикс для сравнения
    const path = location.replace(/^\/admin/, '') || '/';
    
    if (path === '/' || path === '') {
      return <AdminDashboard stats={stats} />;
    } else if (path === '/users' || path === '/users/') {
      return <AdminUsers />;
    } else if (path === '/products' || path === '/products/') {
      return <AdminProducts />;
    } else if (path === '/requests' || path === '/requests/') {
      return <AdminRequests />;
    } else if (path === '/categories' || path === '/categories/') {
      return <AdminCategories />;
    }
    
    return <AdminDashboard stats={stats} />;
  };

  return (
    <AdminLayout user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode}>
      {getCurrentPage()}
    </AdminLayout>
  );
}

function App() {
  const location = useLocation();
  
  // Страница профиля другого пользователя (/user/123/)
  const userMatch = location.match(/^\/user\/(\d+)\/$/);
  if (userMatch) {
    return <ProfileWrapper viewUserId={userMatch[1]} />;
  }
  
  // Страница профиля
  if (location === '/profile/') {
    return <ProfileWrapper />;
  }
  
  // Страница товара
  if (location.startsWith('/product/')) {
    return <ProductDetail />;
  }
  
  if (location === '/admin/' || location === '/admin' || 
      location.startsWith('/admin/users') || 
      location.startsWith('/admin/products') || 
      location.startsWith('/admin/requests')) {
    return <AdminPage />;
  }
  
  return <MainPageWithAuth />;
}

function MainPageWithAuth() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  const [user, setUser] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/me/`, {
        headers: { 'Authorization': `Token ${token}` }
      })
        .then(res => res.ok ? res.json() : Promise.reject())
        .then(data => setUser(data))
        .catch(() => localStorage.removeItem('token'));
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products/`),
        fetch(`${API_URL}/api/categories/`)
      ]);
      setProducts(await productsRes.json());
      setCategories(await categoriesRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      }).catch(() => {});
    }
    setUser(null);
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] flex items-center justify-center">
        <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>
      </div>
    );
  }

  if (user?.is_admin || user?.role === 'admin') {
    return (
      <AdminPage />
    );
  }

  return (
    <>
      <UserCatalog
        products={products}
        categories={categories}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onLogout={handleLogout}
        onLoginClick={() => setIsLoginModalOpen(true)}
      />
      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
      )}
    </>
  );
}

export default function Root() {
  return (
    <Router>
      <App />
    </Router>
  );
}
