import { useState, useEffect, useMemo, useRef } from 'react';
import { Router, useLocation, Link } from './router';
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
import { AdminLayout, AdminDashboard } from './components/AdminLayout';
import { AdminUsers } from './components/AdminUsers';
import { AdminProducts } from './components/AdminProducts';
import { AdminRequests } from './components/AdminRequests';

const API_URL = '';

function UserCatalog({ products, categories, darkMode, setDarkMode, user, onLogout, onLoginClick }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryRequest, setShowCategoryRequest] = useState(false);
  const [showProductRequest, setShowProductRequest] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
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
                <span className="hidden sm:inline font-['Inter'] text-[14px] text-[#6e6893] dark:text-[#b8b3d4]">{user.username}</span>
                <button
                  onClick={() => setShowNotifications(true)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
                >
                  <img src="/bell.svg" alt="Уведомления" className="w-4 h-4 sm:w-5 sm:h-5 dark:brightness-200" />
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860]"
                >
                  <img src={darkMode ? '/sun.svg' : '/moon.svg'} alt="Тема" className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={onLogout}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#f8f7ff] dark:bg-[#2d2847] border border-[#e8e4ff] dark:border-[#3d3860] flex items-center justify-center hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d]"
                  title="Выйти"
                >
                  <img src="/logout.svg" alt="Выйти" className="w-4 h-4 sm:w-5 sm:h-5 dark:brightness-200" />
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
            <img src="/Search.svg" alt="Поиск" className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-[#6e6893]" />
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
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setShowProductRequest(true)}
                className="bg-[#6d5bd0] h-11 sm:h-12 px-3 sm:px-5 rounded-xl font-['Inter'] font-medium text-[12px] sm:text-[14px] text-white hover:bg-[#5d4bc0] whitespace-nowrap"
              >
                + Товар
              </button>
              <button
                onClick={() => setShowCategoryRequest(true)}
                className="bg-white dark:bg-[#25213b] h-11 sm:h-12 px-3 sm:px-5 rounded-xl font-['Inter'] font-medium text-[12px] sm:text-[14px] text-[#6d5bd0] border border-[#e8e4ff] dark:border-[#3d3860] hover:bg-[#f8f7ff] dark:hover:bg-[#2d2847] whitespace-nowrap"
              >
                + Категория
              </button>
            </div>
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
                    <img src="/nothas_image.svg" alt="Нет изображения" className="w-16 h-16 opacity-50" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-['Inter'] font-semibold text-[16px] text-[#25213b] dark:text-white mb-1">{product.name}</h3>
                  <p className="font-['Inter'] text-[13px] text-[#6e6893] dark:text-[#b8b3d4] mb-2">{product.category_name}</p>
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
                    В наличии: {product.quantity} {product.unit}
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
        />
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

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !filters.category || p.category_name === filters.category;
      const matchesPriceMin = !filters.priceMin || parseFloat(p.price) >= parseFloat(filters.priceMin);
      const matchesPriceMax = !filters.priceMax || parseFloat(p.price) <= parseFloat(filters.priceMax);
      const matchesDiscount = filters.hasDiscount === '' || 
        (filters.hasDiscount === 'true' && p.has_discount) ||
        (filters.hasDiscount === 'false' && !p.has_discount);
      return matchesSearch && matchesCategory && matchesPriceMin && matchesPriceMax && matchesDiscount;
    });
  }, [products, searchQuery, filters]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    sorted.sort((a, b) => {
      let aVal, bVal;
      
      if (sortConfig.key === 'total') {
        aVal = parseFloat(a.total) || 0;
        bVal = parseFloat(b.total) || 0;
      } else {
        aVal = a[sortConfig.key];
        bVal = b[sortConfig.key];
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
      }
      
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [filteredProducts, sortConfig]);

  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  const totalCost = useMemo(() => {
    return products.reduce((sum, p) => sum + (parseFloat(p.total) || 0), 0);
  }, [products]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/products/${deletingId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      setProducts(prev => prev.filter(p => p.id !== deletingId));
    } catch (err) {
      console.error(err);
    }
    setIsConfirmModalOpen(false);
    setDeletingId(null);
  };

  const handleSaveProduct = async (formData) => {
    const token = localStorage.getItem('token');
    try {
      // Проверяем есть ли изображение
      const hasImage = formData.get('image') instanceof File;
      
      // Если есть изображение - используем FormData, иначе JSON
      if (hasImage) {
        // Отправляем как FormData с токеном в заголовке
        if (editingProduct) {
          const res = await fetch(`${API_URL}/api/products/${editingProduct.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Token ${token}`
            },
            body: formData
          });
          const updated = await res.json();
          setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
        } else {
          const res = await fetch(`${API_URL}/api/products/`, {
            method: 'POST',
            headers: { 
              'Authorization': `Token ${token}`
            },
            body: formData
          });
          const created = await res.json();
          setProducts([...products, created]);
        }
      } else {
        // Отправляем как JSON
        const data = {};
        formData.forEach((value, key) => {
          if (key === 'hasDiscount') {
            data[key] = value === 'true';
          } else if (key === 'category') {
            data[key] = parseInt(value);
          } else if (key === 'quantity' || key === 'discountPercent') {
            data[key] = parseInt(value);
          } else if (key === 'price') {
            data[key] = parseFloat(value);
          } else if (key !== 'image') {
            data[key] = value;
          }
        });

        if (editingProduct) {
          const res = await fetch(`${API_URL}/api/products/${editingProduct.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          const updated = await res.json();
          setProducts(products.map(p => p.id === editingProduct.id ? updated : p));
        } else {
          const res = await fetch(`${API_URL}/api/products/`, {
            method: 'POST',
            headers: { 
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
          const created = await res.json();
          setProducts([...products, created]);
        }
      }
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch {
      setIsErrorModalOpen(true);
    }
  };

  const handleApplyFilters = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
    setIsFilterModalOpen(false);
  };

  const handleImageClick = (image) => {
    if (image) {
      setSelectedImage(image);
      setIsImageModalOpen(true);
    }
  };

  const handleItemsPerPageChange = (value) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1);
  };

  const minPrice = useMemo(() => Math.min(...products.map(p => parseFloat(p.price) || 0), 0), [products]);
  const maxPrice = useMemo(() => Math.max(...products.map(p => parseFloat(p.price) || 0), 9999), [products]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] p-3 sm:p-4 md:p-6 flex items-center justify-center">
        <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] flex items-center justify-center p-4">
        <div className="bg-white dark:bg-[#25213b] rounded-2xl p-8 text-center max-w-md">
          <h2 className="font-['Inter'] font-bold text-[24px] text-[#25213b] dark:text-white mb-4">
            Админ-панель
          </h2>
          <p className="font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4] mb-6">
            Войдите для управления товарами
          </p>
          <button
            onClick={() => setIsLoginModalOpen(true)}
            className="bg-[#6d5bd0] px-6 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
          >
            Войти
          </button>
        </div>
        {isLoginModalOpen && (
          <LoginModal
            onClose={() => setIsLoginModalOpen(false)}
            onLogin={handleLogin}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] p-3 sm:p-4 md:p-6 transition-colors">
      <Header 
        totalCost={totalCost} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        user={user}
        onLogout={handleLogout}
        onNotificationsClick={() => setShowNotifications(true)}
      />
      
      <div className="h-[2px] bg-[#6d5bd0] mb-3 sm:mb-4 md:mb-6"></div>

      <div className="bg-white dark:bg-[#25213b] rounded-2xl p-3 sm:p-4 md:p-6 transition-colors">
        <Toolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onFilterClick={() => setIsFilterModalOpen(true)}
          onAddClick={handleAddProduct}
        />

        <ProductTable
          products={paginatedProducts}
          sortConfig={sortConfig}
          onSort={handleSort}
          onEdit={handleEditProduct}
          onDelete={handleDeleteClick}
          onImageClick={handleImageClick}
        />

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={sortedProducts.length}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={handleItemsPerPageChange}
        />
      </div>

      {isProductModalOpen && (
        <ProductModal
          product={editingProduct}
          categories={categories}
          onClose={() => setIsProductModalOpen(false)}
          onSave={handleSaveProduct}
          onError={() => setIsErrorModalOpen(true)}
        />
      )}

      {isFilterModalOpen && (
        <FilterModal
          filters={filters}
          categories={categories}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onClose={() => setIsFilterModalOpen(false)}
          onApply={handleApplyFilters}
        />
      )}

      {isErrorModalOpen && (
        <ErrorModal onClose={() => setIsErrorModalOpen(false)} />
      )}

      {isImageModalOpen && (
        <ImageModal image={selectedImage} onClose={() => setIsImageModalOpen(false)} />
      )}

      {isConfirmModalOpen && (
        <ConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setIsConfirmModalOpen(false)}
        />
      )}

      {isLoginModalOpen && (
        <LoginModal
          onClose={() => setIsLoginModalOpen(false)}
          onLogin={handleLogin}
        />
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

function AdminPages() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

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
        .catch(() => {
          localStorage.removeItem('token');
          window.location.href = '/admin/';
        });
    } else {
      window.location.href = '/admin/';
    }
  }, []);

  const handleLogout = () => {
    const token = localStorage.getItem('token');
    if (token) {
      fetch(`${API_URL}/api/auth/logout/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` }
      }).catch(() => {});
    }
    localStorage.removeItem('token');
    window.location.href = '/admin/';
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

  const renderPage = () => {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-[#f2f0f9] dark:bg-[#1a1625] p-6 flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white mb-4">Доступ запрещён</h1>
            <p className="font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4] mb-4">У вас нет прав администратора</p>
            <a href="/admin/" className="text-[#6d5bd0] hover:underline font-['Inter']">Вернуться</a>
          </div>
        </div>
      );
    }

    if (location === '/admin/' || location === '/admin') {
      return <AdminDashboard stats={stats} />;
    } else if (location === '/admin/users/' || location === '/admin/users') {
      return <AdminUsers />;
    } else if (location === '/admin/products/' || location === '/admin/products') {
      return <AdminProducts />;
    } else if (location === '/admin/requests/' || location === '/admin/requests') {
      return <AdminRequests />;
    }
    
    return <AdminDashboard stats={stats} />;
  };

  return (
    <AdminLayout user={user} onLogout={handleLogout} darkMode={darkMode} setDarkMode={setDarkMode}>
      {renderPage()}
    </AdminLayout>
  );
}

function App() {
  const location = useLocation();
  
  // Страница товара
  if (location.startsWith('/product/')) {
    return <ProductDetail />;
  }
  
  if (location === '/admin/' || location === '/admin' || 
      location.startsWith('/admin/users') || 
      location.startsWith('/admin/products') || 
      location.startsWith('/admin/requests')) {
    return <AdminPages />;
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
