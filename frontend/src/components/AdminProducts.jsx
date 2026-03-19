import { useState, useEffect } from 'react';
import { ProductModal } from './ProductModal';
import { ErrorModal } from './ErrorModal';
import { ConfirmModal } from './ConfirmModal';

const API_URL = '';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    console.log('AdminProducts: fetchData started, token:', token ? 'exists' : 'MISSING');
    if (!token) {
      console.error('AdminProducts: No token found!');
      setLoading(false);
      return;
    }
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        fetch(`${API_URL}/api/products/`, { headers: { 'Authorization': `Token ${token}` } }),
        fetch(`${API_URL}/api/categories/`)
      ]);
      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      console.log('AdminProducts: Categories loaded:', categoriesData);
      console.log('AdminProducts: Products loaded:', productsData.length);
      setProducts(productsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('AdminProducts: Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteClick = (id) => {
    setDeletingId(id);
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    const token = localStorage.getItem('token');
    try {
      await fetch(`${API_URL}/api/products/${deletingId}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Token ${token}` }
      });
      setProducts(products.filter(p => p.id !== deletingId));
    } catch (err) {
      console.error(err);
    }
    setShowConfirm(false);
    setDeletingId(null);
  };

  const handleSaveProduct = async (formData) => {
    const token = localStorage.getItem('token');
    try {
      const hasImage = formData.get('image') instanceof File;
      let res;
      
      if (hasImage) {
        if (editProduct) {
          res = await fetch(`${API_URL}/api/products/${editProduct.id}/`, {
            method: 'PATCH',
            headers: { 'Authorization': `Token ${token}` },
            body: formData
          });
        } else {
          res = await fetch(`${API_URL}/api/products/`, {
            method: 'POST',
            headers: { 'Authorization': `Token ${token}` },
            body: formData
          });
        }
      } else {
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

        if (editProduct) {
          res = await fetch(`${API_URL}/api/products/${editProduct.id}/`, {
            method: 'PATCH',
            headers: { 
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
        } else {
          res = await fetch(`${API_URL}/api/products/`, {
            method: 'POST',
            headers: { 
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
          });
        }
      }

      // Проверяем статус ответа
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error('Ошибка сервера:', res.status, errorData);
        setShowError(true);
        return;
      }

      const data = await res.json();
      
      if (editProduct) {
        setProducts(products.map(p => p.id === editProduct.id ? data : p));
      } else {
        setProducts([...products, data]);
      }
      
      setShowModal(false);
      setEditProduct(null);
    } catch (err) {
      console.error('Ошибка при сохранении:', err);
      setShowError(true);
    }
  };

  const handleImageClick = (image) => {
    if (image) {
      // Открыть новое окно по центру экрана 600x600
      const width = 600;
      const height = 600;
      const left = (window.screen.width - width) / 2;
      const top = (window.screen.height - height) / 2;
      window.open(image, '_blank', `width=${width},height=${height},left=${left},top=${top}`);
    }
  };

  if (loading) {
    return <div className="font-['Inter'] text-[#6e6893]">Загрузка...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-['Inter'] font-bold text-[28px] text-[#25213b] dark:text-white">
          Товары
        </h2>
        <button
          onClick={() => { setEditProduct(null); setShowModal(true); }}
          className="bg-[#6d5bd0] px-5 py-3 rounded-xl font-['Inter'] font-semibold text-[14px] text-white hover:bg-[#5d4bc0]"
        >
          + Добавить товар
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 font-['Inter'] text-[#6e6893] dark:text-[#b8b3d4]">
          Нет товаров
        </div>
      ) : (
        <div className="bg-white dark:bg-[#25213b] rounded-xl overflow-hidden border border-[#e8e4ff] dark:border-[#3d3860]">
          <table className="w-full">
            <thead className="bg-[#f8f7ff] dark:bg-[#2d2847]">
              <tr>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">ID</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Наименование</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Категория</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Цена</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Кол-во</th>
                <th className="px-4 py-3 text-left font-['Inter'] font-medium text-[13px] text-[#6e6893]">Действия</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className="border-t border-[#e8e4ff] dark:border-[#3d3860]">
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white font-semibold">
                    {String(product.id).padStart(3, '0')}
                  </td>
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white">{product.name}</td>
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#6e6893]">{product.category_name}</td>
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white">
                    ${product.price}
                    {product.has_discount && product.discount_percent > 0 && (
                      <span className="ml-2 text-xs bg-[#6d5bd0] text-white px-2 py-0.5 rounded-full">
                        -{product.discount_percent}%
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-['Inter'] text-[14px] text-[#25213b] dark:text-white">{product.quantity} {product.unit_display}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => { setEditProduct(product); setShowModal(true); }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] transition-colors"
                        title="Редактировать"
                      >
                        <img src="/edit.svg" alt="Ред." className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleImageClick(product.image)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#f4f2ff] dark:hover:bg-[#3d3860] transition-colors"
                        title={product.image ? "Просмотр фото" : "Нет фото"}
                      >
                        <img 
                          src={product.image ? "/has_image.svg" : "/nothas_image.svg"} 
                          alt="Фото" 
                          className="w-4 h-4" 
                        />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(product.id)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#fee2e2] dark:hover:bg-[#4a2d2d] transition-colors"
                        title="Удалить"
                      >
                        <img src="/delete.svg" alt="Удалить" className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editProduct}
          categories={categories}
          onClose={() => { setShowModal(false); setEditProduct(null); }}
          onSave={handleSaveProduct}
          onError={() => setShowError(true)}
        />
      )}

      {showError && (
        <ErrorModal onClose={() => setShowError(false)} />
      )}

      {showConfirm && (
        <ConfirmModal
          onConfirm={handleConfirmDelete}
          onCancel={() => { setShowConfirm(false); setDeletingId(null); }}
        />
      )}
    </div>
  );
}
