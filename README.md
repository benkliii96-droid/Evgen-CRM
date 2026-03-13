# CMS система управления товарами

Полноценная система управления каталогом товаров с админ-панелью и каталогом для пользователей.

## Структура проекта

```
├── backend/                 # Django REST API
│   ├── config/              # Настройки Django
│   ├── users/               # Приложение пользователей
│   ├── products/            # Приложение товаров и категорий
│   ├── requests/            # Запросы на добавление товаров/категорий
│   ├── admin_panel/         # Django admin
│   ├── static/              # Статические файлы
│   ├── manage.py
│   └── requirements.txt
│
└── frontend/                # React SPA (Vite)
    ├── src/
    │   ├── components/      # React компоненты
    │   ├── App.jsx          # Главный компонент
    │   ├── router.jsx       # Клиентский роутер
    │   └── index.css        # Стили (Tailwind)
    ├── public/              # Статические файлы (SVG иконки)
    └── dist/                # Собранный билд
```

---

## API Endpoints

### Аутентификация `/api/auth/`

| Метод | Путь | Описание |
|-------|------|----------|
| POST | `/api/auth/register/` | Регистрация нового пользователя |
| POST | `/api/auth/login/` | Вход (получение токена) |
| POST | `/api/auth/logout/` | Выход (удаление токена) |
| GET | `/api/auth/me/` | Получение данных текущего пользователя |
| POST | `/api/auth/toggle-theme/` | Переключение темы (light/dark) |
| GET | `/api/auth/users/` | Список пользователей (только админ) |
| GET/POST | `/api/auth/users/<id>/` | Управление пользователем |

**Тело запроса регистрации:**
```json
{
  "username": "user1",
  "email": "user1@mail.ru",
  "password": "password123",
  "password_confirm": "password123"
}
```

**Тело запроса входа:**
```json
{
  "username": "user1",
  "password": "password123"
}
```

**Ответ входа:**
```json
{
  "user": { "id": 1, "username": "user1", "role": "user", "is_admin": false },
  "token": "abc123..."
}
```

---

### Товары `/api/products/`

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/products/products/` | Список всех товаров |
| POST | `/api/products/products/` | Создать товар (админ) |
| GET | `/api/products/products/<id>/` | Получить товар |
| PUT/PATCH | `/api/products/products/<id>/` | Обновить товар (админ) |
| DELETE | `/api/products/products/<id>/` | Удалить товар (админ) |
| GET | `/api/products/categories/` | Список категорий |
| GET | `/api/products/stats/` | Статистика (админ) |

**Пример товара:**
```json
{
  "id": 1,
  "name": "Ноутбук",
  "category": 1,
  "category_name": "Электроника",
  "unit": "шт",
  "quantity": 10,
  "price": 50000.00,
  "has_discount": true,
  "discount_percent": 15,
  "description": "Мощный ноутбук",
  "image": "/media/products/photo.jpg",
  "total": 425000.00,
  "created_at": "2024-01-15T10:00:00Z"
}
```

---

### Запросы пользователей `/api/requests/`

| Метод | Путь | Описание |
|-------|------|----------|
| GET | `/api/requests/products/` | Список запросов на товары |
| POST | `/api/requests/products/` | Создать запрос на товар |
| GET/PUT | `/api/requests/products/<id>/` | Просмотр/обработка запроса |
| GET | `/api/requests/categories/` | Список запросов на категории |
| POST | `/api/requests/categories/` | Создать запрос на категорию |

**Статусы запросов:** `pending` → `approved` | `rejected`

---

## Схема взаимодействий

### Для обычного пользователя

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Браузер       │     │   React SPA     │     │   Django API    │
│                 │     │                 │     │                 │
│ 1. Открывает    │────▶│ 2. Загружает    │────▶│ 3. GET /products/
│    главную      │     │    каталог      │     │    /categories/ │
│    страницу     │     │                 │     │                 │
│                 │     │                 │◀────│ 4. Возвращает   │
│                 │     │                 │     │    JSON данные  │
│                 │     │                 │     │                 │
│ 5. Видит        │     │ 6. Рендерит     │     │                 │
│    карточки     │◀────│    товары       │     │                 │
│    товаров      │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Авторизация пользователя

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Браузер       │     │   React SPA     │     │   Django API    │
│                 │     │                 │     │                 │
│ 1. Нажимает     │────▶│ 2. Показывает   │     │                 │
│    "Войти"      │     │    модалку      │     │                 │
│                 │     │                 │     │                 │
│ 3. Вводит       │────▶│ 4. POST /login/ │────▶│ 5. Проверяет    │
│    логин/пароль │     │    с данными    │     │    credentials  │
│                 │     │                 │     │                 │
│                 │     │                 │◀────│ 6. Возвращает   │
│                 │     │                 │     │    user + token │
│                 │     │                 │     │                 │
│ 7. Сохраняет    │◀────│ 8. Сохраняет    │     │                 │
│    token        │     │    в localStorage│    │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Предложение товара пользователем

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Браузер       │     │   React SPA     │     │   Django API    │
│                 │     │                 │     │                 │
│ 1. Нажимает     │────▶│ 2. Показывает   │     │                 │
│    "Предложить  │     │    форму        │     │                 │
│    товар"       │     │                 │     │                 │
│                 │     │                 │     │                 │
│ 3. Заполняет    │────▶│ 4. POST         │────▶│ 5. Создаёт      │
│    форму        │     │    /requests/   │     │    ProductRequest│
│                 │     │    products/    │     │    (status=     │
│                 │     │                 │     │    pending)     │
│                 │     │                 │◀────│                 │
│                 │     │                 │     │                 │
│ 7. Видит        │◀────│ 6. Показывает   │     │                 │
│    успех        │     │    уведомление  │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Админ-панель

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Браузер       │     │   React SPA     │     │   Django API    │
│                 │     │                 │     │                 │
│ 1. Переходит    │────▶│ 2. Проверяет    │────▶│ 3. GET /me/     │
│    /admin/      │     │    токен + роль │     │    + is_admin   │
│                 │     │                 │     │                 │
│                 │     │◀──── Проверка   │     │                 │
│                 │     │     прав         │     │                 │
│                 │     │                 │     │                 │
│ 4. Если admin:  │────▶│ 5. Загружает    │────▶│ 6. GET /products/
│    показывает   │     │    админ-панель │     │    /stats/      │
│    панель       │     │                 │     │    /users/      │
│    иначе: 403   │     │                 │     │    /requests/   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

---

## Роли пользователей

| Роль | Права |
|------|-------|
| `user` | Просмотр каталога, предложение товаров/категорий |
| `admin` | Полный доступ: CRUD товаров, категорий, управление пользователями, модерация запросов |

---

## Модели данных

### User
```
- id: int
- username: str (unique)
- email: str
- password: str (hashed)
- role: str ('admin' | 'user')
- avatar: ImageField
- is_admin: property → role == 'admin'
- created_at: datetime
```

### Category
```
- id: int
- name: str (unique)
- created_at: datetime
```

### Product
```
- id: int
- name: str
- category: FK → Category
- unit: str ('шт' | 'кг' | 'л' | 'м' | 'упак')
- quantity: int
- price: Decimal
- has_discount: bool
- discount_percent: int (0-100)
- description: Text
- image: ImageField
- total: property → quantity * price * (1 - discount/100)
- created_at: datetime
- updated_at: datetime
```

### ProductRequest (запрос на добавление товара)
```
- id: int
- user: FK → User
- name: str
- category: FK → Category
- unit: str
- quantity: int
- price: Decimal
- has_discount: bool
- discount_percent: int
- description: Text
- image: ImageField
- status: str ('pending' | 'approved' | 'rejected')
- admin_comment: Text
- created_at: datetime
```

### CategoryRequest (запрос на добавление категории)
```
- id: int
- user: FK → User
- name: str
- status: str ('pending' | 'approved' | 'rejected')
- admin_comment: Text
- created_at: datetime
```

---

## Компоненты React

### Основные страницы

| Компонент | Описание |
|-----------|----------|
| `App.jsx` | Главный компонент, роутинг между каталогом и админкой |
| `UserCatalog` | Каталог товаров для обычных пользователей |
| `AdminPage` | Старая админ-панель (таблица товаров) |
| `AdminPages` | Новая админ-панель с роутингом |

### Админ-компоненты

| Компонент | Описание |
|-----------|----------|
| `AdminLayout` | Обёртка с хедером, сайдбаром, темой |
| `AdminDashboard` | Главная страница админки со статистикой |
| `AdminUsers` | Управление пользователями |
| `AdminProducts` | Управление товарами |
| `AdminRequests` | Модерация запросов |

### UI компоненты

| Компонент | Описание |
|-----------|----------|
| `Header` | Верхняя панель (поиск, тема, профиль) |
| `Toolbar` | Панель с фильтрами и кнопками |
| `ProductTable` | Таблица товаров с сортировкой |
| `TableRow` / `TableHeader` | Строки и заголовки таблицы |
| `Pagination` | Пагинация |
| `LoginModal` | Модалка входа/регистрации |
| `ProductModal` | Форма создания/редактирования товара |
| `FilterModal` | Модалка фильтров |
| `ErrorModal` | Ошибка |
| `ImageModal` | Просмотр изображения |
| `ConfirmModal` | Подтверждение удаления |
| `ProductRequestModal` | Предложение товара |
| `CategoryRequestModal` | Предложение категории |

---

## Запуск проекта

### Требования

- Python 3.10+
- Node.js 18+
- npm или yarn

### Backend

```bash
cd cms/backend

# Создание виртуального окружения
python -m venv venv
source venv/bin/activate  # Linux/Mac
# или: venv\Scripts\activate  # Windows

# Установка зависимостей
pip install -r requirements.txt

# Миграции
python manage.py migrate

# Запуск
python manage.py runserver
```

API будет доступен на `http://localhost:8000`

### Frontend

```bash
cd cms/frontend

# Установка зависимостей
npm install

# Запуск dev сервера
npm run dev

# Билд для продакшена
npm run build
```

Приложение будет доступно на `http://localhost:5173`

### Создание суперпользователя

```bash
cd cms/backend
python manage.py createsuperuser
```

---

## Схема URL

| Путь | Компонент |
|------|-----------|
| `/` | Каталог товаров (UserCatalog) |
| `/admin/` | Админ-панель |
| `/admin/users/` | Управление пользователями |
| `/admin/products/` | Управление товарами |
| `/admin/requests/` | Модерация запросов |

---

## Технологии

### Backend
- **Django 5** — веб-фреймворк
- **Django REST Framework** — REST API
- **SQLite** — база данных (по умолчанию)

### Frontend
- **React 18** — UI фреймворк
- **Vite** — сборщик
- **Tailwind CSS** — стили
- **React Router** — роутинг

---

## Переменные окружения

### Backend (config/settings.py)

Можно создать `.env` файл:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

### Frontend

В `src/App.jsx` есть `API_URL = ''` — можно изменить если backend на другом хосте.

---

## Лицензия

MIT
